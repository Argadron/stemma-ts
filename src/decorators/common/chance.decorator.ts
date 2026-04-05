/**
 * Decorator marks this method as a Chance method (will be executed only when % chance done)
 * Grouppable decorator.
 * @param procent - Chance procent
 */
export function Chance(procent: number) {
    if (procent > 1) procent = parseFloat(`0.${(procent / 10).toString().replace('.', '')}`)

    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        const original = descriptor.value

        descriptor.value = function (...args: any[]) {
            if (Math.random() <= procent) return original.apply(this, args)
        }

        return descriptor
    }
}