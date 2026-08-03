import type { GameEvent } from "@enums"
import { generateSignalProxy, isStage3Dec, registerAnyDecorator } from "@decorators"

/**
 * Decorator applied to plugins classes, listen any event
 * @param event - Event to listen
 */
export function OnEvent(event: keyof typeof GameEvent, signal?: string) {
    return (target: any, methodName: any, descriptor: PropertyDescriptor) => {
        let liveInstance: any = undefined
        
        if (isStage3Dec(target, methodName)) methodName.addInitializer(function (this: any) {
            liveInstance = this
        })

        registerAnyDecorator(target, methodName, 'events', { event }, 'METHOD', signal ? (generateSignalProxy(() => liveInstance, signal, descriptor)) : undefined)
    }
}