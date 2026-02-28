import type { IItemPickedUpErrorData } from "@";
import { ITERACTION_ERRORS } from "@const";
import { CommandType } from "@enums";
import type { MiddlewareFn } from "@types";
import { canIteract, extractEntityFromMiddlewareContext, getItemInPosition } from "@utils";

export const PickUpGuard: MiddlewareFn = (cmd, next, game, ctx) => {
    if (cmd.type !== CommandType.PICKUP) return next()
    else {
        const entity = extractEntityFromMiddlewareContext(cmd, ctx, game)

        if (entity) {
            const position = cmd.data.position

            let anyErrorData;

            if (!canIteract(entity, position)) anyErrorData = {
                reason: ITERACTION_ERRORS.OUT_OF_REACH,
                position
            }

            const item = getItemInPosition(position, game.options.map.getAllItems())

            if (!item) anyErrorData = {
                reason: ITERACTION_ERRORS.NOT_FOUND,
                position
            }

            if (anyErrorData) {
                game.processEvent<IItemPickedUpErrorData>('itemPickedUpError', {
                    entity,
                    eventTime: game.currentTick,
                    eventData: anyErrorData
                })

                return
            }
            else return next()
        }
    }
}
export default PickUpGuard