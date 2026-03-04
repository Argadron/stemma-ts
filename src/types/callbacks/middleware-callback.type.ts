import type { Game } from "@";
import type { ICommand } from "@interfaces";

/**
 * Middleware function type
 */
export type MiddlewareFn = (command: ICommand, next: VoidFunction, game: Game, ctx: Record<string, any>) => void;