import type { OnUIEventDecoratorProperties } from "@types";
import { generateSignalProxy, isStage3Dec, registerAnyDecorator } from "@decorators";

/**
 * Decorator marks this method as listener of UI events.
 * Will be worked only on browser (document !== 'undefined')
 * @param param0 - Event to sub
 */
export function OnUIEvent({ event, id }: Omit<OnUIEventDecoratorProperties, 'methodName'>, signal?: string) {
    return (target: any, methodName: any, descriptor: PropertyDescriptor) => {
        let liveInstance: any = undefined
                
        if (isStage3Dec(target, methodName)) methodName.addInitializer(function (this: any) {
            liveInstance = this
        })

        registerAnyDecorator(target, methodName, 'uiListeners', { event, id }, 'METHOD', signal ? (generateSignalProxy(() => liveInstance, signal, descriptor)) : undefined)
    }
}