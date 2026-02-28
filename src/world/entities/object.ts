import type { Entity, GameMap } from "@world";
import { FactoryKeys, GameObjectEnum } from "@enums";
import type { IGameObject, ITriggerActivatedData, ITowerShootedData } from "@interfaces";
import type { EntityManager } from "@";
import type { Position } from "@types";
import { createId, createQuadFromPosition, useAttack } from "@utils";
import { IteractionsFactory } from "@factories"

export class GameObject implements IGameObject {
    readonly id: number;

    type: GameObjectEnum;
    position: Position;
    name: string;
    iteractionId?: number | undefined;
    metadata?: any;

    private readonly map: GameMap;
    private readonly manager: EntityManager;
    
    public constructor(obj: IGameObject, manager: EntityManager, map: GameMap, metadata?: any) {
       this.name = obj.name
       this.position = obj.position
       this.type = obj.type
       this.iteractionId = obj.iteractionId
       this.manager = manager
       this.map = map
       this.metadata = metadata
       this.id = obj.id ?? createId()
    }

    /**
     * Shoot method. (attack in entity eqvivalent, only works on Tower object type)
     * @returns { { deathsCounter: number } } - Count of deaths
     */
    public shoot(): { deathsCounter: number; } {
        const entites = this.map.getInQuad(createQuadFromPosition(this.position), 'ENTITES')

        let counter = 0;

        for (const victim of entites) {
            const { isDead } = useAttack(this.map.game, this.metadata.damage, this, victim)

            if (isDead) counter++
        }

        this.map.game.processEvent<ITowerShootedData>('towerShooted', {
            eventTime: this.map.game.currentTick,
            eventData: {
                tower: this,
                victims: entites,
                deathsCount: counter
            }
        })

        return {
            deathsCounter: counter
        }
    }

    /**
     * Interact action with this GameObject
     * @param e - Entity, who make iteraction
     * @returns { void } 
     */
    public interact(entity: Entity): void {
        const iteraction = this.manager.game.getFactory<IteractionsFactory>(FactoryKeys.ITERACTIONS).get(this.iteractionId!)!

        iteraction.use(entity, this, this.manager.game)
    }

    /**
     * Convert GameObject for snapshot DTO
     * @returns { IGameObject }
     */
    public toDTO(): IGameObject {
        const dtoMetadata = { ...this.metadata }

        if (this.type === GameObjectEnum.CHEST && dtoMetadata?.items) dtoMetadata.items = dtoMetadata.items.map((i: GameObject) => i.toDTO())

        return {
            id: this.id,
            type: this.type,
            position: this.position,
            name: this.name,
            iteractionId: this.iteractionId,
            metadata: dtoMetadata
        }
    }

    /**
     * Object tick actions (Internal use)
     */
    public tick() {
        if (this.type === GameObjectEnum.TRIGGER && this.metadata?.isSensor) {
            this.metadata.currentTick = (this.metadata.currentTick ?? 0) + 1

            if (this.metadata.currentTick % (this.metadata.scanInterval ?? 10) !== 0) return;

            const entities = this.map.getAllInPosition(this.position, 'ENTITES')

            entities.forEach((entity) => this.map.game.processEvent<ITriggerActivatedData>('triggerSensorActive', {
                entity,
                eventTime: this.map.game.currentTick,
                eventData: {
                    trigger: this
                }
            }))
        }
    }

    /**
     * Load object from snapshot
     * @param data - Object data
     * @param manager - Entity Manager reference
     * @param map - Game map reference
     * @returns { GameObject }
     */
    public static fromSnapshot(data: IGameObject, manager: EntityManager, map: GameMap): GameObject {
        if (data.type === GameObjectEnum.CHEST && data.metadata?.items) data.metadata.items = data.metadata.items.map((i: IGameObject) => new GameObject(i, manager, map, i.metadata))

        return new GameObject(data, manager, map, data.metadata)
    }
}