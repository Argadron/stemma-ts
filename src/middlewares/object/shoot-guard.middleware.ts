import { CommandType, GameObjectEnum } from "@enums";
import type { MiddlewareFn } from "@types";
import { extractObjectFromMiddlewareContext } from "@utils";

export const ShootGuard: MiddlewareFn = (cmd, next, game, ctx) => {
    if (cmd.type !== CommandType.TOWER_SHOOT) return next()
    else {
        const object = extractObjectFromMiddlewareContext(cmd, ctx, game)

        if (object && object.type === GameObjectEnum.TOWER) return next()
    }
}
export default ShootGuard