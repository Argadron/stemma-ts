import type { Game } from "@";
import type { Entity, GameObject } from "@world";
import type { CommandType } from "@enums";
import type { IUseValidationResult } from "@interfaces";
import { USE_VALIDATION_EVENT_PREFIX } from "@const";
import { anyWorldObjectIsGameObject } from "@utils";

/**
 * Throw validation event, all plugins can listen and block/unblock it
 * @param game - Game reference
 * @param subject - Subject, who make action
 * @param action - Command to execute
 * @param ctx - Context in this hook
 * @returns { IUseValidationResult } - Hook result
 */
export function useValidation<T = any>(game: Game, subject: Entity | GameObject, action: CommandType, ctx: Record<string, any>): IUseValidationResult {
    const resultContext = {
        ...ctx,
        isAllowed: true,
        errors: [],
    } as IUseValidationResult & T

    game.processCustomEvent<T>(`${USE_VALIDATION_EVENT_PREFIX}:${action}`, {
        entity: subject,
        eventTime: game.currentTick,
        eventData: resultContext
    })

    return {
        ...resultContext,
        isAllowed: resultContext.isAllowed && resultContext.errors.length === 0,
        confirm: (data) => {
            if (!resultContext.isAllowed) return false
            else {
                const isObject = anyWorldObjectIsGameObject(subject)

                game.dispatch({
                    data,
                    entityId: isObject ? undefined : subject.id,
                    objectId: !isObject ? undefined : subject.id,
                    tick: game.currentTick,
                    type: action
                })

                return true
            }
        }
    }
}