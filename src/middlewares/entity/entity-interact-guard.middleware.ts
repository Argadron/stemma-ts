import { CommandType, FactoryKeys } from "@enums";
import type { IteractionsFactory } from "@factories";
import type { MiddlewareFn } from "@types";
import { checkQuadsOverlapping, createQuadFromPosition, extractEntityFromMiddlewareContext } from "@utils";

export const EntityInteractGuard: MiddlewareFn = (cmd, next, game, ctx) => {
    if (cmd.type !== CommandType.INTERACT_POSITION) return next()
    else {
        const entity = extractEntityFromMiddlewareContext(cmd, ctx, game)

        if (entity) {
            if (ctx.objects && ctx.objects?.length === 0) return
            else {
                const objects = game.options.map.getAllInPosition(cmd.data.position, 'OBJECTS')

                ctx.objects = objects

                if (objects.length !== 0) {
                    let success = false;

                    for (const intreactObj of objects) {
                        if (intreactObj.iteractionId) {
                            if (!checkQuadsOverlapping(createQuadFromPosition(intreactObj.position), createQuadFromPosition(entity.position, 2))) continue
                            else {
                                const iteraction = game.getFactory<IteractionsFactory>(FactoryKeys.ITERACTIONS).get(intreactObj.iteractionId)

                                if (iteraction && (!(iteraction.can) || iteraction.can(entity, intreactObj))) success = true
                            }
                        }
                    }

                    return success ? next() : null
                }
            }
        }
    }
}
export default EntityInteractGuard