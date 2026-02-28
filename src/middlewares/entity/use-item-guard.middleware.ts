import { CommandType } from "@enums";
import type { MiddlewareFn } from "@types";
import { extractEntityFromMiddlewareContext } from "@utils";

/**
 * Built-in use current item middleware
 */
export const UseItemGuard: MiddlewareFn = (cmd, next, game, ctx) => {
    if (cmd.type !==  CommandType.USE_ITEM) return next()
    else {
        const entity = extractEntityFromMiddlewareContext(cmd, ctx, game)

        if (entity && entity.currentActiveItem && entity.currentActiveItem?.metadata?.onUse) return next()
    }
}
export default UseItemGuard