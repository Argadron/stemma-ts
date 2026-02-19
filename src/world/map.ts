import { Game } from "@";
import { GameObjectEnum } from "@enums";
import type { 
    IMovedCollisionData, 
    IMovedData, 
    IGameObject, 
    IObjectCreatedCollisionData, 
    IObjectCreatedErrorData,
    IGameMap as Map
} from "@interfaces";
import type { EntityManager } from "@";
import type { Position, Quad, AnyPosition, CreateTowerMetadata, CreateItemMetadata, CreateUsableItemMetadata } from "@types";
import { convertAnyPositionToPosition, checkTwoPositions, gameObjectIsItem, getInPosition } from "@utils";
import { Entity, GameObject } from "@world";

export class GameMap implements Map {
    public readonly manager: EntityManager;
    public readonly game: Game;

    private objects: GameObject[] = []

    private validateObject<T = any>(object: GameObject, metadata?: T) {
        if (this.checkCollisions(object, object.position)) {
            this.game.processEvent<IObjectCreatedCollisionData>('objectCreatedCollision', {
                eventTime: new Date(),
                eventData: {
                    object
                }
            })
        }

        if (object.type === GameObjectEnum.ITEM) {
            const itemMetadata = metadata as Partial<CreateItemMetadata & CreateUsableItemMetadata>

            if (!itemMetadata?.damageBuff && !itemMetadata?.healthBuff && !itemMetadata.onUse) this.game.processEvent<IObjectCreatedErrorData<CreateItemMetadata>>('itemCreatedError', {
                eventTime: new Date(),
                eventData: {
                    mailformedMetadata: itemMetadata,
                    objectId: object.id
                }
            })
        }

        if (object.type === GameObjectEnum.TOWER) {
            const towerMetadata = metadata as Partial<CreateTowerMetadata>

            if (!towerMetadata?.damage) this.game.processEvent<IObjectCreatedErrorData<CreateTowerMetadata>>('towerCreatedError', {
                eventTime: new Date(),
                eventData: {
                    objectId: object.id,
                    mailformedMetadata: towerMetadata
                }
            })
        }
    }

    public checkCollisions(entity: Entity | GameObject, newPosition: Position) {
        const entitesAndObjects = this.getAllInPosition(newPosition)

        if (entitesAndObjects.length === 0) return false
        else {
            for (const collision of entitesAndObjects) {
                if (collision.id !== entity.id) return true
            }

            return false
        }
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

    public getAllInPosition(position: Position) {
        const entites = this.manager.entites.filter((entity) => checkTwoPositions(position, entity.position))
        const objects = this.objects.filter((obj) => checkTwoPositions(obj.position, position))

        return [...entites, ...objects]
    }

    public createObject<T = any>(obj: IGameObject, metadata?: T) {
        const object = new GameObject(obj, this.manager, this, metadata)

        this.objects.push(object)
        this.validateObject(object, metadata)

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