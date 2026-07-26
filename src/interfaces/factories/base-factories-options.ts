import type { Game } from "@core";
import type { GeometryTypes } from "@types";

export interface IBaseFactoriesOptions<G extends GeometryTypes='2D'|'3D'> {
    /**
     * Game reference
     */
    readonly game: Game<G>;

    /**
     * If true, auto connect factory instance to game (game.connectFactory())
     */
    readonly useAutoConnect?: boolean;
}