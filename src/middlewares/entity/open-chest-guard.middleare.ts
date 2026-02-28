import type { IChestOpenErrorData } from "@";
import { ITERACTION_ERRORS } from "@const";
import { CommandType } from "@enums";
import type { MiddlewareFn } from "@types";
import { canIteract, extractEntityFromMiddlewareContext, getChestInPosition } from "@utils";

export const OpenChestGuard: MiddlewareFn = (cmd, next, game, ctx) => {
    if (cmd.type !== CommandType.OPEN_CHEST) return next()
    else {
        const entity = extractEntityFromMiddlewareContext(cmd, ctx, game)

        if (entity) {
            const position = cmd.data.position

            let anyErrorData;

            if (!canIteract(entity, position)) anyErrorData = {
                reason: ITERACTION_ERRORS.OUT_OF_REACH,
                position
            }

            const chest = getChestInPosition(position, game.options.map.getAllInPosition(position, 'OBJECTS'))

            if (!chest) anyErrorData = {
                reason: ITERACTION_ERRORS.NOT_FOUND,
                position
            }
            else if (!chest.metadata?.items) anyErrorData = {
                reason: ITERACTION_ERRORS.CHEST_MAILFORMED,
                position
            }

            if (anyErrorData) {
                game.processEvent<IChestOpenErrorData>('chestOpenedError', {
                    entity,
                    eventTime: game.currentTick,
                    eventData: {
                        ...anyErrorData,
                        position,
                        chest: chest?.metadata
                    }
                })

                return
            }
            else return next()
        }
    }
}
export default OpenChestGuard