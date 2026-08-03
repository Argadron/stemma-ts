import type { Signal } from "@interfaces"
import type { CommandContext } from "@types"

/**
 * Decorator marks this method as a Chance method (will be executed only when % chance done)
 * Grouppable decorator.
 * @param procent - Chance procent
 */
export function Chance(procent: number, signalKey?: string) {
    if (procent > 1) procent = parseFloat(`0.${(procent / 10).toString().replace('.', '')}`)

    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        const original = descriptor.value
        const bounded = new WeakSet()

        descriptor.value = function (this: CommandContext, ...args: any[]) {
            if (signalKey && !bounded.has(this)) {
                const signalToken = this[signalKey] as Signal | undefined

                if (signalToken) {
                    bounded.add(this)

                    signalToken.sub((...data: any) => original.apply(this, data))
                }
            }

            if (Math.random() <= procent) return original.apply(this, args)
        }

        return descriptor
    }
}