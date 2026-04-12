import type { Game } from "@core";
import type { ICommand } from "@interfaces";
import type { CommandContext } from "@types";

/**
 * Lifecycle callback type
 */
export type LifecycleCallback = (game: Game, cmd: ICommand, ctx: CommandContext) => void;