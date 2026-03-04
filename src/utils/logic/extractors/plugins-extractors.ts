import type { IPlugin } from "@interfaces"

/**
 * Extract method from provided plugin
 * @param plugin - Plugin to extract
 * @param methodName - Method name
 * @returns { Function | undefined } - Metod if founded, else undefined
 */
export function extractMethodFromPlugin(plugin: IPlugin, methodName: string): Function | undefined {
    return (plugin as any)[methodName]
}

/**
 * Extract property from provided plugin
 * @param plugin - Plugin to extract
 * @param propertyName - Property name
 * @returns { string | undefined } - Property if founded, else false
 */
export function extractPropertyFromPlugin(plugin: IPlugin, propertyName: string): string | undefined {
    return (plugin as any)[propertyName]
}