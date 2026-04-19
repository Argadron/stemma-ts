import type { Game } from "@core";
import type { Entity, GameObject } from "@world";
import { canSee } from "@utils";
import type { IUseVisibiltyResult, IUseVisibilityContext } from "@interfaces";
import { USE_VISIBILITY_EVENT } from "@const";

/**
 * Util calculate how well observer can see target. Throwing useVisibility:calcVisibility custom event
 * @param observer - Who see
 * @param target - Target
 * @param core - Game reference (if hydration disabled)
 * @returns { IUseVisibiltyResult } - Result of check
 */
export function useVisibility(observer: Entity | GameObject, target: Entity | GameObject, core?: Game): IUseVisibiltyResult {
    const game = useVisibility.prototype.game as Game || core

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