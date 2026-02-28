import type { IItemDroppedErrorData } from "@";
import { ITERACTION_ERRORS } from "@const";
import { CommandType } from "@enums";
import type { MiddlewareFn } from "@types";
import { checkCollisions, extractEntityFromMiddlewareContext } from "@utils";
import type { GameObject } from "@world";

export const DropItemGuard: MiddlewareFn = (cmd, next, game, ctx) => {
    if (cmd.type !== CommandType.DROP_ITEM) return next()
    else {
        const entity = extractEntityFromMiddlewareContext(cmd, ctx, game)

        if (entity) {
            const item = entity.getItemFromInventoryByItemOrId(cmd.data.item)

            if (!item) {
                game.processEvent<IItemDroppedErrorData>('itemDroppingError', {
                    eventData: {
                        position: cmd.data.position,
                        reason: ITERACTION_ERRORS.NOT_FOUND
                    },
                    eventTime: game.currentTick,
                    entity
                })

                return;
            }
            else {
                if (checkCollisions(game.options.map.getAllInPosition(cmd.data.position), item as GameObject)) {
                    game.processEvent<IItemDroppedErrorData>('itemDroppingError', {
                        eventTime: game.currentTick,
                        entity,
                        eventData: {
                            item,
                            position: cmd.data.position,
                            reason: ITERACTION_ERRORS.COLLISION
                        }
                    })

                    return;
                }
                else return next()
            }
        }
    }
}
export default DropItemGuard