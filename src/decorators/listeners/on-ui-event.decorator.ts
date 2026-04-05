import type { OnUIEventDecoratorProperties } from "@types";
import { registerAnyDecorator } from "../utils/decorators-utils.js";

/**
 * Decorator marks this method as listener of UI events.
 * Will be worked only on browser (document !== 'undefined')
 * @param param0 - Event to sub
 */
export function OnUIEvent({ event, id }: Omit<OnUIEventDecoratorProperties, 'methodName'>) {
    return (target: any, methodName: string) => registerAnyDecorator(target, methodName, 'uiListeners', { event, id }, 'METHOD')
}