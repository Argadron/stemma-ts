import { Game } from "@";
import { GameObjectEnum } from "@enums";
import type { 
    IMovedCollisionData, 
    IMovedData, 
    IGameObject, 
    IObjectCreatedCollisionData, 
    IObjectCreatedErrorData,
    IGameMap as Map,
    ITriggerActivatedData,
    IWorldObjectHearedNoiseData
} from "@interfaces";
import type { EntityManager, IGameEffect } from "@";
import type { 
    Position, 
    Quad, 
    AnyPosition, 
    CreateTowerMetadata, 
    CreateItemMetadata, 
    CreateUsableItemMetadata, 
    CreateChestMetadata, 
    CreateTriggerMetadata
} from "@types";
import { 
    convertAnyPositionToPosition, 
    checkTwoPositions, 
    gameObjectIsItem, 
    getInPosition, 
    createQuadFromPosition,
    checkCollisions
} from "@utils";
import { Entity, GameObject } from "@world";
import { BASE_HEARING_RADIUS } from "@const";

export class GameMap implements Map {
    public readonly manager: EntityManager;
    public readonly game: Game;

    public objects: GameObject[] = []

    /**
     * Validate and executing error events for new object
     * @param object - Object to create
     * @param metadata - Object metadata
     */
    private validateObject<T = any>(object: GameObject, metadata?: T) {
        if (object.type === GameObjectEnum.ITEM) {
            const itemMetadata = metadata as Partial<CreateItemMetadata & CreateUsableItemMetadata>

            if (!itemMetadata?.damageBuff && !itemMetadata?.healthBuff && !itemMetadata.onUse && !itemMetadata.weight) this.game.processEvent<IObjectCreatedErrorData<CreateItemMetadata>>('itemCreatedError', {
                eventTime: this.game.currentTick,
                eventData: {
                    mailformedMetadata: itemMetadata,
                    objectId: object.id
                }
            })
        }

        if (object.type === GameObjectEnum.TOWER) {
            const towerMetadata = metadata as Partial<CreateTowerMetadata>

            if (!(towerMetadata?.damage)) this.game.processEvent<IObjectCreatedErrorData<CreateTowerMetadata>>('towerCreatedError', {
                eventTime: this.game.currentTick,
                eventData: {
                    objectId: object.id,
                    mailformedMetadata: towerMetadata
                }
            })
        }

        if (object.type === GameObjectEnum.CHEST) {
            const chestMetadata = metadata as Partial<CreateChestMetadata>

            let isCreateOk = true

           if (chestMetadata?.items) {
             isCreateOk = chestMetadata.items.every((itemOrId) => !isNaN(typeof itemOrId === 'number' ? itemOrId : itemOrId.id))
           } 
           else isCreateOk = false

           if (!isCreateOk) this.game.processEvent<IObjectCreatedErrorData<CreateChestMetadata>>('chestCreatedError', {
                eventTime: this.game.currentTick,
                eventData: {
                    mailformedMetadata: chestMetadata,
                    objectId: object.id
                }
           })
           else {
                const correctData = chestMetadata.items!

                chestMetadata.items = correctData.map((item) => {
                    if (typeof item === 'object') return item
                    else return this.getObject(item)
                }).filter((item) => item !== undefined)
           }
        }

        if (object.type === GameObjectEnum.TRIGGER) {
            const triggerMetadata = object.metadata as Partial<CreateTriggerMetadata>

            if (!(triggerMetadata.real) || !(triggerMetadata.trigger)) this.game.processEvent<IObjectCreatedErrorData<CreateTriggerMetadata>>('triggerCreatedError', {
                eventTime: this.game.currentTick,
                eventData: {
                    objectId: object.id,
                    mailformedMetadata: triggerMetadata
                }
            })
        }
    }

    /**
     * Get all triggers in provided position
     * @param position - Position to get triggers
     * @returns { GameObject[] } - All triggers in position
     */
    public getTriggersInPosition(position: Position): GameObject[] {
        return this.objects.filter((obj) => (checkTwoPositions(obj.position, position) && obj.type === GameObjectEnum.TRIGGER))
    }

    /**
     * Push correct object to map. Internal method (no use, if you dont know what do)
     * @param obj - Game object to push
     * @returns { void }
     */
    public pushObject(obj: GameObject): void {
        this.objects.push(obj)
    }
 
    public load(rawObjects: IGameObject[]) {
        this.objects = rawObjects.map((object) => GameObject.fromSnapshot(object, this.manager, this))
    }

    public constructor(manager: EntityManager, game: Game) {
        this.manager = manager
        this.game = game
    }

    public getInQuad(quad: Quad, returnType?: 'ALL'): (Entity | GameObject)[];
    public getInQuad(quad: Quad, returnType: 'ENTITES'): Entity[];
    public getInQuad(quad: Quad, returnType: 'OBJECTS'): GameObject[];
    public getInQuad(quad: Quad, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity[] | GameObject[] | (Entity | GameObject)[];
    public getInQuad(quad: Quad, returnType:'ALL' | 'ENTITES' | 'OBJECTS' = 'ALL') {
        const [minX, minY, maxX, maxY] = quad; 

        const entites = this.manager.entites.filter((entity) => {
            const [xB, yB] = entity.position

            return xB >= minX && xB <= maxX && 
            yB >= minY && yB <= maxY
        })
        const objects = this.objects.filter((object) => {
            const [xB, yB] = object.position

            return xB >= minX && xB <= maxX && 
            yB >= minY && yB <= maxY
        })

        switch (returnType) {
            case 'ENTITES':
                return entites
            case 'OBJECTS':
                return objects
            default:
                return [...objects, ...entites]
        }
    }

    public teleport(id: number, to: AnyPosition) {
        const entity = this.manager.get(id)

        if (!entity) return false

        const position = convertAnyPositionToPosition(to)

        this.game.processEvent<IMovedData>('entityMoved', {
            entity,
            eventTime: this.game.currentTick,
            eventData: {
                entity,
                startPosition: entity.position,
                newPosition: to
            }
        })

        entity.position = position
        
        const triggers = this.getTriggersInPosition(position)
        
        const noiseRadius = Math.floor(entity.totalWeight / 10)
        const entitesWhoHeard = this.getInQuad(createQuadFromPosition(entity.position, noiseRadius < BASE_HEARING_RADIUS ? BASE_HEARING_RADIUS : noiseRadius))

        entitesWhoHeard.forEach((worldObject) => {
            if (worldObject.id === id) return;

            this.game.processEvent<IWorldObjectHearedNoiseData>('gameObjectHearedNoise', {
            entity: worldObject,
            eventTime: this.game.currentTick,
            eventData: {
                fromEntity: entity
            }})
        }
        )
        triggers.forEach((trig) => {
            const metadata = trig.metadata as CreateTriggerMetadata

            metadata.trigger(entity, trig)

            this.game.processEvent<ITriggerActivatedData>('triggerActivated', {
                entity,
                eventTime: this.game.currentTick,
                eventData: {
                    trigger: trig
                }
            })
        })

        return entity
    }

    public getAllInPosition(position: Position, returnType?: 'ALL'): (Entity | GameObject)[];
    public getAllInPosition(position: Position, returnType: 'ENTITES'): Entity[];
    public getAllInPosition(position: Position, returnType: 'OBJECTS'): GameObject[];
    public getAllInPosition(position: Position, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity[] | GameObject[] | (Entity | GameObject)[];
    public getAllInPosition(position: Position, returnType:'ALL' | 'ENTITES' | 'OBJECTS'='ALL') {
        const entites = this.manager.entites.filter((entity) => checkTwoPositions(position, entity.position))
        const objects = this.objects.filter((obj) => checkTwoPositions(obj.position, position))

        switch (returnType) {
            case 'ENTITES':
                return entites
            case 'OBJECTS':
                return objects
            default:
                return [...objects, ...entites]
        }
    }

    public createObject<T = any>(obj: IGameObject, metadata?: T) {
        const object = new GameObject(obj, this.manager, this, metadata ?? obj.metadata)

        this.objects.push(object)
        this.validateObject(object, metadata ?? obj.metadata)

        return object
    }

    public deleteObject(id: number) {
        const currentLength = this.objects.length

        this.objects = this.objects.filter((object) => !(object.id === id))

        if (this.objects.length === currentLength) return false
        else return true
    }

    public getObject(id: number) {
        return this.objects.find((object) => object.id === id)
    }

    public getAllItems() {
        return this.objects.filter((obj) => gameObjectIsItem(obj))
    }

    public checkObjectOk(id: number): boolean {
        const object = this.getObject(id)

        if (!object) return false
        if (!getInPosition(object.position, this.objects)) return false

        return !checkCollisions(this.getAllInPosition(object.position), object)
    }

    public applyEffectToQuad(quad: Quad, effect: IGameEffect, duration: number, excludeId?: number) {
        const entities = this.getInQuad(quad, 'ENTITES')

        if (entities.length === 0) return []
        else {
            entities.forEach((entity) => excludeId === entity.id ? entity : entity.applyEffect(effect, duration))

            return entities
        }
    }
}