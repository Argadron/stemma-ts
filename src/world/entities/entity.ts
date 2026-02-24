import { GameObject, type GameMap } from "@world";
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
    IItemDroppedData,
    IGameEffect,
    IGameObject
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
import type { EffectFactory } from "@factories";

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

    private effects: (IGameEffect & { remaining: number })[] = [];
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

    /**
     * Get one item from entity inventory
     * @param item - Item to search
     */
    private getItemFromInventoryByItemOrId(item: GameObject): IWorldItem | undefined

    /**
     * Get one item from entity inventory
     * @param id - ID of item
     */
    private getItemFromInventoryByItemOrId(id: number): IWorldItem | undefined
    private getItemFromInventoryByItemOrId(itemOrId: GameObject | number) {
        return this.inventory.find((item) => item.id === (typeof itemOrId === 'number' ? itemOrId : itemOrId.id))
    }

    /**
     * Delete one item from entity inventory
     * @param item - Item to search
     */
    private deleteItemFromInventory(item: IItem): boolean

    /**
     * Delete one item from entity inventory
     * @param id - ID of item
     */
    private deleteItemFromInventory(id: number): boolean
    private deleteItemFromInventory(itemOrId: IItem | number) {
        const currentLength = this.inventory.length

        this.inventory = this.inventory.filter((item) => item.id !== (typeof itemOrId === 'number' ? itemOrId : itemOrId.id))

        return currentLength === this.inventory.length ? false : true
    }

    /**
     * Get all world objects in radius (Quad)
     * @param searchRadius - Radius to serach entities
     * @param returnType - Type of return array
     */
    public getNearEntitiesAndObjects(searchRadius: number, returnType?: 'ALL'): (Entity | GameObject)[];
    public getNearEntitiesAndObjects(searchRadius: number, returnType: 'ENTITES'): Entity[];
    public getNearEntitiesAndObjects(searchRadius: number, returnType: 'OBJECTS'): GameObject[];
    public getNearEntitiesAndObjects(searchRadius: number, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity[] | GameObject[] | (Entity | GameObject)[];
    public getNearEntitiesAndObjects(searchRadius=BASE_SEARCH_RADIUS, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'='ALL') {
        const entityQuad = createQuadFromPosition(this.position, searchRadius)

        return this.map.getInQuad(entityQuad, returnType)
    }

    /**
     * Attack all targets in 1x1x1x1 quad
     * @param targets - Hard set targets to attack
     * @returns { IAttackResult } - Result of attack
     */
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

    /**
     * Pick Up item in position
     * @param position - Position of item 
     * @returns { IWorldItem | false } - IWorldItem if correct pick up, else false
     */
    public pickUp(position: Position): IWorldItem | false {
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

    /**
     * Drop item to provided position
     * @param item - Item in inventory
     * @param position - Position to drop
     */
    public dropItem(item: GameObject, position: Position): boolean

    /**
     * Drop item to provided position
     * @param id - ID of item in inventory
     * @param position - Position to drop
     */
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

    /**
     * Equip item from inventory
     * @param item - Item in inventory
     */
    public equipItem(item: GameObject): boolean

    /**
     * Equip item from inventory
     * @param id - ID of item in inventory
     */
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

    /**
     * Use (execute use() callback) current active item
     * @returns { boolean } - True if correct use, else false
     */
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

    /**
     * Move entity to new position
     * @param position - Position to move
     * @returns { boolean | Entity } - Entity reference if correct move, else false
     */
    public move(position: Position): boolean | Entity {
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

    /**
     * Open chest in provided position
     * @param position - Position to open chest
     * @returns { boolean } - True if correct open, else false
     */
    public openChest(position: Position): boolean {
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

    /**
     * Apply new effect to entity. If entity already has effect, duration will be rewrited
     * @param effect - GameEffect
     * @param duration - Effect duration
     * @returns { void }
     */
    public applyEffect(effect: IGameEffect, duration: number): void {
        const existing = this.effects.find((eff) => eff.id === effect.id)

        if (existing) {
            existing.remaining = duration
        }
        else {
            this.effects.push({
                ...effect,
                remaining: duration
            })
        }
    }

    /**
     * Entity tick actions (internal use)
     */
    public tick() {
        this.effects = this.effects.filter((effect) => {
            effect.onTick(this, effect)
            effect.remaining --

            if (effect.remaining <= 0) {
                if (effect.onEnd) effect.onEnd(this, effect)

                return false
            }
            else return true
        })
    }

    /**
     * Convert this entity to DTO
     * @returns { Entity }
     */
    public toDTO(): Entity {
        return {
            id: this.id,
            health: this.health,
            damage: this.damage,
            isDead: this.isDead,
            name: this.name,
            inventory: this.inventory.map((item) => ({ ...item })),
            effects: this.effects,
            currentActiveItem: this.currentActiveItem
        } as any
    }

    /**
     * Get full damage of this entity (calc entity damage + current item damage buff)
     */
    public get fullDamage() {
        return this.currentActiveItem ? this.damage + (this.currentActiveItem.damageBuff ?? 0) : this.damage
    }

    /**
     * Get full walkBuff of this entity (calc default walk step, and all items buffs/debuffs,
     * calc items weight (10 weight = -1 walk))
     */
    public get walkBuff() {
        return this.inventory.reduce((accum, item) => accum+(item.walkBuff ?? 0)-(item.weight ? Math.floor(item.weight / 10) : 1), 0)
    }

    /**
     * Get full armor of this entity (calc healthBuff of items in inventory)
     */
    public get armorHealth() {
        return this.inventory.reduce((accum, item) => accum+(item.healthBuff ?? 0), 0)
    }

    /**
     * Return a weight of items in inventory
     */
    public get totalWeight() {
        return this.inventory.reduce((accum, item) => accum+(item.weight ?? 1), 0)
    }

    /**
     * Load entity from snapshot
     * @param data - Entity raw data
     * @param manager - Entity manager reference
     * @param map - Game map reference
     * @returns { Entity }
     */
    public static fromSnapshot(data: any, manager: EntityManager, map: GameMap, effectFactory: EffectFactory): Entity {
        const entity = new Entity(data, manager, map)

        if (data.inventory && Array.isArray(data.inventory)) entity.inventory = data.inventory.map((i: IGameObject) => GameObject.fromSnapshot(i, manager, map)) 
        if (data.currentActiveItem) entity.currentActiveItem = entity.inventory.find((item) => item.id === data.currentActiveItem.id)
        if (data.effects && Array.isArray(data.effects)) entity.effects = data.effects.map((effect: any) => ({
                ...effectFactory.get(effect.id),
                remaining: effect.remaining
            })).filter(Boolean)

        return entity
    }
}