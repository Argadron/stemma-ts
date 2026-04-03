import type { Game } from "@";
import type { ICommand } from "@interfaces";
import type { CommandContext } from "@types";

/**
 * Middleware function type
 */
export type MiddlewareFn = (command: ICommand, next: VoidFunction, game: Game, ctx: CommandContext) => void;