import type { MiddlewareFn } from "@types";
import { extractEntityFromMiddlewareContext } from "@utils";

/**
 * Built-In entity always required active item middleware
 */
export const ActiveItemRequiredGuard: MiddlewareFn = (cmd, next, game, ctx) => {
    const entity = extractEntityFromMiddlewareContext(cmd, ctx, game)

    if (entity && entity.currentActiveItem && entity.currentActiveItem?.metadata) return next()
}
export default ActiveItemRequiredGuard