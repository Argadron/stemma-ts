import { Game } from "@core";
import type { 
    IEntityManager,
    IGameMap,
    IInitGameOptions, 
} from "@interfaces";
import type { GeometryTypes } from "@types";

export * from "./const/index.js"
export * from "./core/index.js"
export * from "./enums/index.js"
export * from "./interfaces/index.js"
export * from "./types/index.js"
export * from "./utils/index.js"
export * from "./world/index.js"
export * from "./middlewares/index.js"
export * from "./factories/index.js"
export * from "./store/global-store.js"
export * from "./decorators/index.js"
export * from "./plugins/index.js"

/**
 * Create new game function (fast create)
 * @param options - Init game options
 * @returns { [game: Game, manager: IEntityManager, map: IGameMap] } - Array with main game iteract objects
 */
export const createGame = <G extends GeometryTypes = '2D'>(options?: IInitGameOptions<G>): [game: Game, manager: IEntityManager<G>, map: IGameMap<G>] => {
    const game = new Game<G>(options)

    return [game, game.options.manager, game.options.map] as const
}
export default createGame