import { registerAnyDecorator } from "@decorators";

/**
 * Decorator applied to plugin classes, listen any customEvent
 * @param event 
 */
export function OnCustomEvent(event: string) {
    return (target: any, methodName: string) => registerAnyDecorator(target, methodName, 'customEvents', { event }, 'METHOD')
}