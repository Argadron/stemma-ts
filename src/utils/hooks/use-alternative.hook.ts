import { Game } from "@core";
import type { ICommand } from "@interfaces";
import { AsyncPlugin } from "@plugins";

/**
 * This hook allows you to client-side prediction command
 * Command will be executed in alternative game
 * @param command - Command(s) to execute in alternative world
 * @param core - Game reference if hydration disabled
 * @returns { Promise<Game> } - Alternative isolated game (not affect real)
 */
export async function useAlternative<T = any>(command: ICommand<T> | ICommand<T>[], core?: Game): Promise<Game> {
    const game = useAlternative.prototype.game as Game || core

    const asyncPlugin = new AsyncPlugin()
    const alternative = Game.fromSnapshot(game.save(), alternative => alternative.registerPlugin(asyncPlugin))

    if (!Array.isArray(command)) await asyncPlugin.asyncExecute(command)
    else for (const cmd of command) await asyncPlugin.asyncExecute(cmd)

    return alternative
}