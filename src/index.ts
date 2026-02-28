import { Game } from "@";
import type { 
    IEntityManager,
    IGameMap,
    IInitGameOptions, 
} from "@interfaces";

export * from "./game.js"
export * from "./manager.js"
export * from "./undo-manager.js"
export * from "./const/index.js"
export * from "./enums/index.js"
export * from "./interfaces/index.js"
export * from "./types/index.js"
export * from "./utils/index.js"
export * from "./world/index.js"
export * from "./factories/index.js"
export * from "./store/global-store.js"

/**
 * Create new game function (fast create)
 * @param options - Init game options
 * @returns { [game: Game, manager: IEntityManager, map: IGameMap] } - Array with main game iteract objects
 */
export const createGame = (options?: IInitGameOptions): [game: Game, manager: IEntityManager, map: IGameMap] => {
    const game = new Game(options)

    return [game, game.options.entites.manager, game.options.map] as const
}
export default createGame