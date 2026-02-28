import { DEFAULT_WALK_STEP } from "@const";
import { CommandType } from "@enums";
import type { IEntityMovedOutOfRangeData } from "@interfaces";
import type { MiddlewareFn } from "@types";
import { checkTwoQuads, createQuadFromPosition, extractEntityFromMiddlewareContext } from "@utils";

/**
 * Built-in MovementGuard middleware 
 */
export const MovementGuard: MiddlewareFn = (cmd, next, game, ctx) => {
    if (cmd.type !== CommandType.MOVE) return next()
    else {
        const entity = extractEntityFromMiddlewareContext(cmd, ctx, game)
        const position = cmd.data.position

        if (entity) {
            if (!checkTwoQuads(createQuadFromPosition(position), createQuadFromPosition(entity.position, DEFAULT_WALK_STEP+entity.walkBuff))) {
                game.processEvent<IEntityMovedOutOfRangeData>('entityMovedOutOfRange', {
                    entity,
                    eventTime: game.currentTick,
                    eventData: {
                        tryMoveTo: position
                    }
                })
            }
            else next()
        }
    }
}
export default MovementGuard