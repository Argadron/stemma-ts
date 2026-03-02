/**
 * Execute this method in provided interval
 * @param interval - Interval in ticks
 * @param type - When execute method (after tick or before)
 */
export function OnTick(interval: number, type: 'before' | 'after'='before') {
    return (target: any, methodName: string) => {
        if (!target.__ticks) target.__ticks = []

        target.__ticks.push({ interval, methodName, type })
    }
}