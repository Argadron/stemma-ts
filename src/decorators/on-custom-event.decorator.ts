/**
 * Decorator applied to plugin classes, listen any customEvent
 * @param event 
 */
export function OnCustomEvent(event: string) {
    return (target: any, methodName: string) => {
        if (!target.__customEvents) target.__customEvents = []

        target.__customEvents.push({ methodName, event })
    }
}