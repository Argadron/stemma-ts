import { CommandType } from "@enums";
import type { MiddlewareFn } from "@types";
import { extractEntityFromMiddlewareContext } from "@utils";

export const EquipItemGuard: MiddlewareFn = (cmd, next, game, ctx) => {
    if (cmd.type !== CommandType.EQUIP_ITEM) return next()
    else {
        const entity = extractEntityFromMiddlewareContext(cmd, ctx, game)

        if (entity && !entity.currentActiveItem && entity.getItemFromInventoryByItemOrId(cmd.data.item)) return next()
    }
}
export default EquipItemGuard