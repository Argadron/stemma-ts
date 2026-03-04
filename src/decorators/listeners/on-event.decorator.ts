import type { GameEvent } from "@enums"

/**
 * Decorator applied to plugins classes, listen any event
 * @param event - Event to listen
 */
export function OnEvent(event: keyof typeof GameEvent) {
    return (target: any, methodName: string) => {
        if (!target.__events) target.__events = []

        target.__events.push({ event, methodName })
    }
}