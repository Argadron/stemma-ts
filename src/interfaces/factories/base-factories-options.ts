import type { Game } from "@core";

export interface IBaseFactoriesOptions {
    /**
     * Game reference
     */
    readonly game: Game;

    /**
     * If true, auto connect factory instance to game (game.connectFactory())
     */
    readonly useAutoConnect?: boolean;
}