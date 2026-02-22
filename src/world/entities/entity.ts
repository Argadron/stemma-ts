import type { GameMap, GameObject } from "@world";
import { 
    BASE_SEARCH_RADIUS, 
    DEFAULT_WALK_STEP, 
    emptyAttackResult, 
    ITERACTION_ERRORS 
} from "@const";
import type { 
    IAttackData, 
    IAttackResult,
    IEntityMovedOutOfRangeData, 
    IItemPickedUpData, 
    IItemPickedUpErrorData, 
    IItemUsedData,
    ITarget, 
    IWorldItem,
    IItem,
    IChestOpenErrorData,
    IChestOpenedData,
    IItemDroppedErrorData,
    IItemDroppedData
} from "@interfaces";
import type { EntityManager } from "@";
import type { CreateUsableItemMetadata, Position } from "@types";
import { 
    canIteract,
    checkTwoQuads, 
    convertGameObjectToInventoryItem, 
    createId, 
    createQuadFromPosition, 
    getChestInPosition, 
    getItemInPosition, 
    useAttack 
} from "@utils";
import { GameObjectEnum } from "@enums";

export class Entity implements ITarget {
    position: Position;
    health: number;
    damage: number;
    isDead: boolean;
    name: string;
    inventory: IItem[] = [];
    
    readonly id = createId()
    
    private readonly manager: EntityManager;
    private readonly map: GameMap;
    private currentActiveItem: IItem | undefined;

    /**
     * Drop all items in current entity position (for Internal use, dont activate if entity alive)
     * @returns {void}
     */
    public dropInventory(): void {
        const dropItems = [...this.inventory]

        dropItems.forEach((item) => this.dropItem(item as GameObject, this.position))
    }

    public constructor(target: ITarget, manager: EntityManager, map: GameMap) {
        this.damage = target.damage
        this.position = target.position
        this.health = target.health
        this.name = target.name
        this.isDead = target.isDead
        this.manager = manager
        this.map = map
    }

    private getItemFromInventoryByItemOrId(item: GameObject): IWorldItem | undefined
    private getItemFromInventoryByItemOrId(id: number): IWorldItem | undefined
    private getItemFromInventoryByItemOrId(itemOrId: GameObject | number) {
        return this.inventory.find((item) => item.id === (typeof itemOrId === 'number' ? itemOrId : itemOrId.id))
    }

    private deleteItemFromInventory(item: IItem): boolean
    private deleteItemFromInventory(id: number): boolean
    private deleteItemFromInventory(itemOrId: IItem | number) {
        const currentLength = this.inventory.length

        this.inventory = this.inventory.filter((item) => item.id !== (typeof itemOrId === 'number' ? itemOrId : itemOrId.id))

        return currentLength === this.inventory.length ? false : true
    }

    public getNearEntitiesAndObjects(searchRadius: number, returnType?: 'ALL'): (Entity | GameObject)[];
    public getNearEntitiesAndObjects(searchRadius: number, returnType: 'ENTITES'): Entity[];
    public getNearEntitiesAndObjects(searchRadius: number, returnType: 'OBJECTS'): GameObject[];
    public getNearEntitiesAndObjects(searchRadius: number, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity[] | GameObject[] | (Entity | GameObject)[];
    public getNearEntitiesAndObjects(searchRadius=BASE_SEARCH_RADIUS, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'='ALL') {
        const entityQuad = createQuadFromPosition(this.position, searchRadius)

        return this.map.getInQuad(entityQuad, returnType)
    }

    public attack(targets?: Entity[]): IAttackResult {
        if (this.isDead) return emptyAttackResult(this)

        let entites: Entity[];
        let counter = 0;

        if (targets) entites = targets
        else entites = this.map.getInQuad(createQuadFromPosition(this.position), 'ENTITES')
        .filter((entity) => entity !== this) // возможно заменить на айди

        for (const entity of entites) {
            const totalDamage = this.fullDamage - entity.armorHealth

            const { isDead } = useAttack(this.manager.game, totalDamage, this, entity)

            if (isDead) counter++
        }

        this.manager.game.processEvent<IAttackData>('attack', {
            eventTime: new Date(),
            entity: this,
            eventData: {
                attacker: this,
                victims: entites
            }
        })

        return {
            victims: entites,
            attacker: this,
            deathsCount: counter
        }
    }

    public pickUp(position: Position) {
        if (this.isDead) return false;

        let anyErrorData;

        if (!canIteract(this, position)) anyErrorData = {
            reason: ITERACTION_ERRORS.OUT_OF_REACH,
            position
        }

        const item = getItemInPosition(position, this.map.getAllItems())

        if (!item) anyErrorData = {
            reason: ITERACTION_ERRORS.NOT_FOUND,
            position
        }

        if (anyErrorData) {
            this.manager.game.processEvent<IItemPickedUpErrorData>('itemPickedUpError', {
                entity: this,
                eventTime: new Date(),
                eventData: anyErrorData
            })

            return false
        }
        else {
            const inventoryItem = item!

            this.inventory.push(inventoryItem)

            this.map.deleteObject(inventoryItem.id)
            this.manager.game.processEvent<IItemPickedUpData>('itemPickedUp', {
                entity: this,
                eventTime: new Date(),
                eventData: {
                    item: inventoryItem!
                }
            })
            
            return inventoryItem
        }
    }

    public dropItem(item: GameObject, position: Position): boolean
    public dropItem(id: number, position: Position): boolean
    public dropItem(itemOrId: GameObject | number, position: Position): boolean {
        const item = this.getItemFromInventoryByItemOrId(typeof itemOrId === 'number' ? itemOrId : itemOrId.id)

        if (!item) {
            this.manager.game.processEvent<IItemDroppedErrorData>('itemDroppingError', {
                eventData: {
                    position,
                    reason: ITERACTION_ERRORS.NOT_FOUND
                },
                eventTime: new Date(),
                entity: this
            })

            return false
        }
        else {
            if (this.map.checkCollisions(item as GameObject, position)) {
                this.manager.game.processEvent<IItemDroppedErrorData>('itemDroppingError', {
                    eventTime: new Date(),
                    entity: this,
                    eventData: {
                        item,
                        position,
                        reason: ITERACTION_ERRORS.COLLISION
                    }
                })

                return false
            }
            else {
                this.map.createObject({
                    ...item,
                    metadata: undefined,
                    position,
                    type: GameObjectEnum.ITEM
                }, item.metadata)
                this.map.game.processEvent<IItemDroppedData>('itemDropping', {
                    entity: this,
                    eventTime: new Date(),
                    eventData: {
                        item,
                        position
                    }
                })
                this.deleteItemFromInventory(item)

                if (item.id === this.currentActiveItem?.id) this.currentActiveItem = undefined

                return true
            }
        }
    }

    public equipItem(item: GameObject): boolean
    public equipItem(id: number): boolean
    public equipItem(itemOrId: GameObject | number): boolean {
        if (this.currentActiveItem) return false;
        else {
            const item = this.getItemFromInventoryByItemOrId(typeof itemOrId === 'number' ? itemOrId : itemOrId.id)

            if (!item) return false
            else {
                this.currentActiveItem = item

                return true
            }
        }
    }

    public useItem(): boolean {
        if (!this.currentActiveItem) return false
        else {
            const metadata = this.currentActiveItem.metadata as CreateUsableItemMetadata

            if (!metadata || !(metadata?.onUse)) return false

            metadata.onUse(this)

            this.manager.game.processEvent<IItemUsedData>('itemUsed', {
                eventTime: new Date(),
                entity: this,
                eventData: {
                    item: this.currentActiveItem
                }
            })

            if (metadata.isConsumable) {
                this.deleteItemFromInventory(this.currentActiveItem)
                this.currentActiveItem = undefined
            }

            return true
        }
    }

    public move(position: Position) {
        if (this.isDead) return false;
        if (!checkTwoQuads(createQuadFromPosition(position), createQuadFromPosition(this.position, DEFAULT_WALK_STEP+this.walkBuff))) {
            this.manager.game.processEvent<IEntityMovedOutOfRangeData>('entityMovedOutOfRange', {
                entity: this,
                eventTime: new Date(),
                eventData: {
                    tryMoveTo: position
                }
            })

            return false
        }
        else return this.map.teleport(this.id, position)
    }

    public openChest(position: Position) {
        if (this.isDead) return false;
        
        let anyErrorData;

        if (!canIteract(this, position)) anyErrorData = {
            reason: ITERACTION_ERRORS.OUT_OF_REACH,
            position
        }

        const chest = getChestInPosition(position, this.map.getAllInPosition(position, 'OBJECTS'))

        if (!chest) anyErrorData = {
            reason: ITERACTION_ERRORS.NOT_FOUND,
            position
        }

        if (anyErrorData) {
            this.manager.game.processEvent<IChestOpenErrorData>('chestOpenedError', {
                entity: this,
                eventTime: new Date(),
                eventData: {
                    ...anyErrorData,
                    position,
                    chest: (chest!).metadata
                }
            })

            return false
        }
        else {
            const realChest = chest!

            realChest.metadata?.items.forEach((item: GameObject) => {
                this.inventory.push(convertGameObjectToInventoryItem(item))
                this.map.deleteObject(item.id)
            })

            this.map.game.processEvent<IChestOpenedData>('chestOpened', {
                    entity: this,
                    eventTime: new Date(),
                    eventData: {
                        chest: realChest.metadata
                    }
                })
            this.map.deleteObject(realChest.id)

            return true
        }
    }

    public get fullDamage() {
        return this.currentActiveItem ? this.damage + (this.currentActiveItem.damageBuff ?? 0) : this.damage
    }

    public get walkBuff() {
        return this.inventory.reduce((accum, item) => accum+(item.walkBuff ?? 0)-(item.weight ? Math.floor(item.weight / 10) : 1), 0)
    }

    public get armorHealth() {
        return this.inventory.reduce((accum, item) => accum+(item.healthBuff ?? 0), 0)
    }
}