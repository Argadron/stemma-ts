import { generateSignalProxy, isStage3Dec, registerAnyDecorator } from "@decorators";

/**
 * Decorator applied to plugin classes, listen any customEvent
 * @param event 
 */
export function OnCustomEvent(event: string, signal?: string) {
    return (target: any, methodName: any, descriptor: PropertyDescriptor) => {
        let liveInstance: any = undefined
        
        if (isStage3Dec(target, methodName)) methodName.addInitializer(function (this: any) {
            liveInstance = this
        })

        registerAnyDecorator(target, methodName, 'customEvents', { event }, 'METHOD', signal ? (generateSignalProxy(() => liveInstance, signal, descriptor)) : undefined)
    }
}