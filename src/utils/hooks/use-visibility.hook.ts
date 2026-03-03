import type { Game } from "@";
import type { Entity, GameObject } from "@world";
import { canSee } from "@utils";
import type { IUseVisibiltyResult, IUseVisibilityContext } from "@interfaces";
import { USE_VISIBILITY_EVENT } from "@const";

/**
 * Util calculate how well observer can see target. Throwing useVisibility:calcVisibility custom event
 * @param game - Game reference
 * @param observer - Who see
 * @param target - Target
 * @returns { IUseVisibiltyResult } - Result of check
 */
export function useVisibility(game: Game, observer: Entity | GameObject, target: Entity | GameObject): IUseVisibiltyResult {
    if (canSee(observer.position, target.position, game.options.map)) {
        const context = {
            isVisible: true,
            factor: 1,
            observer,
            target
        }

        game.processCustomEvent<IUseVisibilityContext>(USE_VISIBILITY_EVENT, {
            entity: observer,
            eventTime: game.currentTick,
            eventData: context
        })

        return { isVisible: (context.isVisible && context.factor > 0), factor: context.factor }
    }
    else return { isVisible: false, factor: 0 }
}