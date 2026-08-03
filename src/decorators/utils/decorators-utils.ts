import type { Signal } from "@interfaces"
import type { CommandContext, SignalProperties } from "@types"

/**
 * Register any decorator in any context
 * @param target - target or undefined
 * @param contextOrProperty - context or propert
 * @param data - data to decorator
 */
export function registerAnyDecorator<T = any>(target: any, contextOrProperty: string | any, decoratorKey: string, data: T, type: 'PROPERTY' | 'METHOD', signal?: SignalProperties) {
    const readyData: any = {
        ...data
    }

    if (!target.__) target.__ = {}

    if (typeof contextOrProperty === 'string') {
        if (!target.__[decoratorKey]) target.__[decoratorKey] = []

        type === 'PROPERTY' ? readyData.propertyName = contextOrProperty : readyData.methodName = contextOrProperty

        target.__[decoratorKey].push(readyData)

        if (signal) {
            const original = signal.descriptor.value
            const bounded = new WeakSet()

            signal.descriptor.value = function (this: CommandContext, ...args: any) {
                if (!bounded.has(this)) {
                    bounded.add(this)

                    this[signal.signalKey].sub((...data: any) => original.apply(this, data))
                }

                return original.apply(this, args)
            }
        }

        return;
    }
    else {
        contextOrProperty.addInitializer(function (this: any) {
            if (!this.__) this.__ = {}
            
            if (!this.__[decoratorKey]) this.__[decoratorKey] = []
            type === 'PROPERTY' ? readyData.propertyName = contextOrProperty.name : readyData.methodName = contextOrProperty.name

            this.__[decoratorKey].push(readyData)

            if (signal) signal.signal.sub((...data: any) => signal.descriptor.value.apply(this, data))
        })
    }
}

/**
 * Generate signal proxy getter
 * @param instanceFn - Target instance fn
 * @param signalKey - Signal key
 * @param descriptor - Descriptor
 * @returns - Proxy object
 */
export function generateSignalProxy(instanceFn: () => any, signalKey: string, descriptor: PropertyDescriptor) {
    return {
        get signal(): Signal {
            const instance = instanceFn()
            console.log(instance)

            if (!instance) throw new Error('[generateSignalProxy]: cant resolve instance')

            return instance[signalKey]
        },
        descriptor,
        signalKey
    }
}

/**
 * Check decorator is Stage 3
 * @param target - Target
 * @param methodName - Method or context
 * @returns { boolean } - True if stage 3, else false
 */
export const isStage3Dec = (target: any, methodName: any): boolean => target === undefined && typeof (methodName as any) !== 'string'