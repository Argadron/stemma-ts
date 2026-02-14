import type { GameMap, Object } from "@world";
import { DEFAULT_WALK_STEP, emptyAttackResult } from "@const";
import type { 
    IAttackData, 
    IAttackResult,
    IDeadData, 
    IEntityMovedOutOfRangeData, 
    IItemPickedUpData, 
    IItemPickedUpErrorData, 
    ITarget, 
    IWorldItem 
} from "@interfaces";
import type { EntityManager } from "@";
import type { Position } from "@types";
import { checkTwoQuads, createId, createQuadFromPosition, getItemInPosition } from "@utils";

export class Entity implements ITarget {
    position: Position;
    health: number;
    damage: number;
    isDead: boolean;
    name: string;
    
    readonly id = createId()
    readonly inventory: IWorldItem[] = [];
    
    private readonly manager: EntityManager;
    private readonly map: GameMap;
    private currentActiveItem: IWorldItem | undefined;

    public constructor(target: ITarget, manager: EntityManager, map: GameMap) {
        this.damage = target.damage
        this.position = target.position
        this.health = target.health
        this.name = target.name
        this.isDead = target.isDead
        this.manager = manager
        this.map = map
    }

    public attack(targets?: Entity[]): IAttackResult {
        if (this.isDead) return emptyAttackResult(this)

        let entites: Entity[];
        let counter = 0;

        if (targets) entites = targets
        else entites = this.map.getInQuad(createQuadFromPosition(this.position))
        .filter((entity) => entity !== this)

        for (const entity of entites) {
            const totalDamage = this.fullDamage - entity.armorHealth

            entity.health = entity.health - (totalDamage >= 0 ? totalDamage : 0)

            if (entity.health <= 0) {
                counter++

                entity.isDead = true

                this.manager.game.processEvent<IDeadData>('entityDead', {
                    eventTime: new Date(),
                    entity,
                    eventData: {
                        entity,
                        killer: this
                    }
                })
            }
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

        if (!checkTwoQuads(createQuadFromPosition(position), createQuadFromPosition(this.position, 2))) anyErrorData = {
            reason: 'OUT OF REACH' as const,
            position
        }

        const item = getItemInPosition(position, this.map.getAllItems())

        if (!item) anyErrorData = {
            reason: 'NOT FOUND' as const,
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

    public equipItem(item: Object): boolean
    public equipItem(id: number): boolean
    public equipItem(itemOrId: Object | number): boolean {
        if (this.currentActiveItem) return false;
        else {
            const item = this.inventory.find((item) => item.id === (typeof itemOrId === 'number' ? itemOrId : itemOrId.id))

            if (!item) return false
            else {
                this.currentActiveItem = item

                return true
            }
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

    public get fullDamage() {
        return this.currentActiveItem ? this.damage + (this.currentActiveItem.damageBuff ?? 0) : this.damage
    }

    public get walkBuff() {
        return this.inventory.reduce((accum, item) => accum+(item.walkBuff ?? 0), 0)
    }

    public get armorHealth() {
        return this.inventory.reduce((accum, item) => accum+(item.healthBuff ?? 0), 0)
    }
}