import type { OnTickDecoratorProperties } from "@types"
import { generateSignalProxy, isStage3Dec, registerAnyDecorator } from "@decorators"

/**
 * Execute this method in provided interval
 * @param interval - Interval in ticks
 * @param type - When execute method (after tick or before)
 */
export function OnTick({ interval, type='before' }: Omit<OnTickDecoratorProperties, 'methodName'>, signal?: string) {
    return (target: any, methodName: any, descriptor: PropertyDescriptor) => {
        let liveInstance: any = undefined
                        
        if (isStage3Dec(target, methodName)) methodName.addInitializer(function (this: any) {
            liveInstance = this
        })

        registerAnyDecorator(target, methodName, 'ticks', { interval, type }, 'METHOD', signal ? (generateSignalProxy(() => liveInstance, signal, descriptor)) : undefined)
    }
}