import { Game } from "@";
import type { 
    IGameOptions, 
} from "@interfaces";

export * from "./game.js"
export * from "./manager.js"
export * from "./const/index.js"
export * from "./enums/index.js"
export * from "./interfaces/index.js"
export * from "./types/index.js"
export * from "./utils/index.js"
export * from "./world/index.js"

export const createGame = (options?: IGameOptions) => {
    const game = new Game(options)

    return [game, game.options.entites.manager, game.options.map] as const
}
export default createGame