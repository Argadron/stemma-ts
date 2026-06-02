import { Game } from "@core";
import type { ICommand } from "@interfaces";
import { AsyncPlugin } from "@plugins";

/**
 * This hook allows you to client-side prediction command
 * Command will be executed in alternative game
 * @param command - Command to execute in alternative world
 * @param core - Game reference if hydration disabled
 * @returns { Promise<Game> } - Alternative isolated game (not affect real)
 */
export async function useAlternative(command: ICommand, core?: Game): Promise<Game> {
    const game = useAlternative.prototype.game as Game || core

    const asyncPlugin = new AsyncPlugin()
    const alternative = Game.fromSnapshot(game.save(), alternative => alternative.registerPlugin(asyncPlugin))

    await asyncPlugin.asyncExecute(command)

    return alternative
}