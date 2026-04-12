import { Game } from "@core";
import type { IPlugin } from "@interfaces";
import { CanvasPlugin, ConsolePlugin, GraphicPlugin } from "@plugins";

export class ConflictResolverPlugin implements IPlugin {
    public readonly name = ConflictResolverPlugin.name;

    public install(game: Game) {
        setTimeout(() => {
            const plugins = game.getAllPlugins()
            const conflicts: string[] = []
            const error = (reason: string) => {
                throw new Error(reason)
            }

            plugins.forEach(plugin => {
            
                const condition = (plugin.name === CanvasPlugin.name || plugin.name === ConsolePlugin.name || plugin.name === GraphicPlugin.name)
            
                if (condition && conflicts.length !== 0) error(`[${ConflictResolverPlugin.name}]: Founded error in activating two plugins, game allows 1: ${plugin.name}-${conflicts[0]}`)
                if (condition) conflicts.push(plugin.name)
            })
        }, 1000)
        
        return true
    }
}