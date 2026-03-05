import type { GameEvent } from "@enums"
import { registerAnyDecorator } from "@decorators"

/**
 * Decorator applied to plugins classes, listen any event
 * @param event - Event to listen
 */
export function OnEvent(event: keyof typeof GameEvent) {
    return (target: any, methodName: string) => registerAnyDecorator(target, methodName, 'events', { event }, 'METHOD')
}