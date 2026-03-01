import { CommandType } from "@enums";
import type { IEntityCreatedCollisionData, IMovedCollisionData, IObjectCreatedCollisionData } from "@interfaces";
import type { MiddlewareFn } from "@types";
import { checkCollisions } from "@utils";
import type { Entity } from "@world";

export const CollisionGuard: MiddlewareFn = (cmd, next, game) => {
    if (cmd.type !== CommandType.MOVE && cmd.type !== CommandType.CREATE_ENTITY && cmd.type !== CommandType.CREATE_OBJECT) return next()
    else {
        const entity = game.options.map.getObject(cmd.data.objectId) ?? game.options.entites.manager.get(cmd.entityId!)
        const entitesAndObjects = game.options.map.getAllInPosition(cmd.data.position ?? cmd.data.target?.position ?? cmd.data.object?.position)

        const isCollision = checkCollisions(entitesAndObjects, entity ?? cmd.data.target ?? cmd.data.object)

        if (entity && isCollision && cmd.type === CommandType.MOVE) {
            game.processEvent<IMovedCollisionData>('entityMovedCollision', {
                entity,
                eventTime: cmd.tick,
                eventData: {
                    entity: entity as Entity,
                    startPosition: entity.position,
                    collisionPosition: cmd.data.position
                }
            })

            return;
        }
        else if (entity && !isCollision && cmd.type === CommandType.MOVE) return next()

        if (cmd.type === CommandType.CREATE_ENTITY && isCollision) {
            game.processEvent<IEntityCreatedCollisionData>('entityCreatedCollision', {
                eventTime: cmd.tick,
                eventData: {
                    target: cmd.data.target 
                }
            })

            return
        }
        if (cmd.type === CommandType.CREATE_OBJECT && isCollision) {
            game.processEvent<IObjectCreatedCollisionData>('objectCreatedCollision', {
                eventTime: cmd.tick,
                eventData: {
                    object: cmd.data.object
                }
            })

            return
        }

        next()
    }
}
export default CollisionGuard