import type { IPlugin } from "@interfaces";
import type { CommandContext } from "@types";

// CommandContext, to dont repeat Record<string, any>
/**
 * Extract prototype of plugin
 * @param plugin - Plugin to extract
 * @returns { CommandContext }
 */
export function createPluginProto(plugin: IPlugin): CommandContext {
    return (Object.getPrototypeOf(plugin).__ ?? (plugin as any).__) || {}
}