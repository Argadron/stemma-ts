import { Game } from "@";
import { GameObjectEnum } from "@enums";
import type { 
    IMovedCollisionData, 
    IMovedData, 
    IGameObject, 
    IObjectCreatedCollisionData, 
    IWorldItem, 
    IItemCreatedErrorData,
    IGameMap as Map
} from "@interfaces";
import type { EntityManager } from "@";
import type { Position, Quad, AnyPosition } from "@types";
import { convertAnyPositionToPosition, checkTwoPositions, gameObjectIsItem } from "@utils";
import { Entity, Object } from "@world";

export class GameMap implements Map {
    public readonly manager: EntityManager;
    public readonly game: Game;

    private objects: Object[] = []

    public checkCollisions(entity: Entity | Object, newPosition: Position) {
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

    public getInQuad(quad: Quad) {
        const [minX, minY, maxX, maxY] = quad;

        return this.manager.entites.filter((entity) => {
            const [xB, yB] = entity.position

            return xB >= minX && xB <= maxX && 
            yB >= minY && yB <= maxY
        })
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
        const object = new Object(obj, this.manager, this, metadata)

        if (this.checkCollisions(object, object.position)) {
            this.game.processEvent<IObjectCreatedCollisionData>('objectCreatedCollision', {
                eventTime: new Date(),
                eventData: {
                    object: obj
                }
            })
        }

        if (obj.type === GameObjectEnum.ITEM) {
            const itemMetadata = metadata as unknown as Partial<IWorldItem>

            if (!itemMetadata.damageBuff || !itemMetadata.healthBuff) this.game.processEvent<IItemCreatedErrorData>('itemCreatedError', {
                eventTime: new Date(),
                eventData: {
                    mailformedMetadata: itemMetadata,
                    objectId: object.id
                }
            })
        }

        this.objects.push(object)

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
}