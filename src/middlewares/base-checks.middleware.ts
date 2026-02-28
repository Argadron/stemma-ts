import { CommandType } from "@enums";
import type { MiddlewareFn } from "@types";

/**
 * Built-in general checks for entity commands
 */
export const baseChecksMiddleware: MiddlewareFn = (command, next, game, ctx) => {
    if (command.type !== CommandType.SET_STATE && command.type !== CommandType.CREATE_ENTITY && command.type !== CommandType.CREATE_OBJECT) {
        if (command.entityId) {
            const entity = game.options.entites.manager.get(command.entityId)

            if (entity && !(entity?.isDead)) {
                ctx.entity = entity

                return next()
            }
        }
        else if (command.objectId) {
            const object = game.options.map.getObject(command.objectId)

            if (object) {
                ctx.object = object

                return next()
            }
        }
    }
    else return next()
}
export default baseChecksMiddleware