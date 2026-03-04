import type { OnTickDecoratorProperties } from "@types"

/**
 * Execute this method in provided interval
 * @param interval - Interval in ticks
 * @param type - When execute method (after tick or before)
 */
export function OnTick({ interval, type='before' }: Omit<OnTickDecoratorProperties, 'methodName'>) {
    return (target: any, methodName: string) => {
        if (!target.__ticks) target.__ticks = []

        target.__ticks.push({ interval, methodName, type })
    }
}