import { Game } from "@";
import { GameObjectEnum } from "@enums";
import type { 
    IMovedCollisionData, 
    IMovedData, 
    IGameObject, 
    IObjectCreatedCollisionData, 
    IObjectCreatedErrorData,
    IGameMap as Map,
    IWorldItem
} from "@interfaces";
import type { EntityManager } from "@";
import type { 
    Position, 
    Quad, 
    AnyPosition, 
    CreateTowerMetadata, 
    CreateItemMetadata, 
    CreateUsableItemMetadata, 
    CreateChestMetadata 
} from "@types";
import { 
    convertAnyPositionToPosition, 
    checkTwoPositions, 
    gameObjectIsItem, 
    getInPosition, 
    anyWorldObjectIsGameObject, 
    gameObjectIsChest
} from "@utils";
import { Entity, GameObject } from "@world";
import { BASE_MAX_WEIGHT_LIMIT_ON_POSITION } from "@const";

export class GameMap implements Map {
    public readonly manager: EntityManager;
    public readonly game: Game;

    private objects: GameObject[] = []

    private validateObject<T = any>(object: GameObject, metadata?: T) {
        if (object.type === GameObjectEnum.ITEM) {
            const itemMetadata = metadata as Partial<CreateItemMetadata & CreateUsableItemMetadata>

            if (!itemMetadata?.damageBuff && !itemMetadata?.healthBuff && !itemMetadata.onUse && !itemMetadata.weight) this.game.processEvent<IObjectCreatedErrorData<CreateItemMetadata>>('itemCreatedError', {
                eventTime: new Date(),
                eventData: {
                    mailformedMetadata: itemMetadata,
                    objectId: object.id
                }
            })
        }

        if (object.type === GameObjectEnum.TOWER) {
            const towerMetadata = metadata as Partial<CreateTowerMetadata>

            if (!(towerMetadata?.damage)) this.game.processEvent<IObjectCreatedErrorData<CreateTowerMetadata>>('towerCreatedError', {
                eventTime: new Date(),
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
                eventTime: new Date(),
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

        if (this.checkCollisions(object, object.position)) {
            this.game.processEvent<IObjectCreatedCollisionData>('objectCreatedCollision', {
                eventTime: new Date(),
                eventData: {
                    object
                }
            })
        }
    }

    public checkCollisions(entity: Entity | GameObject, newPosition: Position) {
        const entitesAndObjects = this.getAllInPosition(newPosition)
        const totalWeight = entitesAndObjects.reduce((accum, objOrEntity) => {
            if (objOrEntity.id === entity.id) return accum
            if (anyWorldObjectIsGameObject(objOrEntity)) {
                if (gameObjectIsChest(objOrEntity)) return accum += objOrEntity.metadata?.items.reduce((accum: number, chestItem: GameObject) => accum += (chestItem.metadata?.weight ?? 1), 0)
                if (gameObjectIsItem(objOrEntity)) return accum += (objOrEntity.metadata?.weight ?? 1)
                else return accum
            }
            else return accum
        }, 0)

        let isCollision = false

        if (entitesAndObjects.length === 0) return false
        else {
            for (const collision of entitesAndObjects) {
                if (collision.id !== entity.id) {
                    const entityIsEntity = !anyWorldObjectIsGameObject(entity)
                    const collisionIsEntity = !anyWorldObjectIsGameObject(collision)

                    if (entityIsEntity) {
                        if (!collisionIsEntity) {
                            if (collision.type !== GameObjectEnum.ITEM) {
                                isCollision = true

                                break
                            }
                        }
                        else {
                            if (!collision.isDead) {
                                isCollision = true

                                break
                            }
                        }
                    }
                    if (!collisionIsEntity) {
                        if (collision.type !== GameObjectEnum.ITEM &&
                            (!entityIsEntity && entity.type !== GameObjectEnum.ITEM)
                        ) {
                            isCollision = true

                            break
                        }
                        if (!entityIsEntity && entity.type === GameObjectEnum.ITEM) {
                            const entityCheckCollision = (entity as IWorldItem).metadata?.weight as number ?? 1

                            if ((totalWeight + entityCheckCollision) >= BASE_MAX_WEIGHT_LIMIT_ON_POSITION) {
                                isCollision = true

                                break
                            }
                        }
                    }
                    else {
                        if (!collision.isDead) {
                            isCollision = true

                            break
                        }
                    }
                }
            }

            return isCollision
        }
    }

    /**
     * Push correct object to map. Internal method (no use, if you dont know what do)
     * @param obj - Game object to push
     * @returns { void }
     */
    public pushObject(obj: GameObject): void {
        this.objects.push(obj)
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

        if (this.checkCollisions(entity, position)) {
            this.game.processEvent<IMovedCollisionData>('entityMovedCollision', {
                entity,
                eventTime: new Date(),
                eventData: {
                    entity,
                    startPosition: entity.position,
                    collisionPosition: to
                }
            })

            return false
        }

        this.game.processEvent<IMovedData>('entityMoved', {
            entity,
            eventTime: new Date(),
            eventData: {
                entity,
                startPosition: entity.position,
                newPosition: to
            }
        })

        entity.position = position

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
        const object = new GameObject(obj, this.manager, this, metadata)

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

    /**
     * Checks a given object by ID is ok: exists, no collisions in position, exists in position
     * @param id - ID to check object
     * @returns { boolean } - True, if all OK
     */
    public checkObjectOk(id: number): boolean {
        const object = this.getObject(id)

        if (!object) return false
        if (!getInPosition(object.position, this.objects)) return false

        return !this.checkCollisions(object, object.position)
    }
}