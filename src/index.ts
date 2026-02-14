import { Game } from "@";
import type { 
    IGameOptions, 
} from "@interfaces";

export * from "./game"
export * from "./manager"
export * from "./const"
export * from "./enums"
export * from "./interfaces"
export * from "./types"
export * from "./utils"
export * from "./world"

export default function createGame(options?: IGameOptions) {
    const game = new Game(options)

    return [game, game.options.entites.manager, game.options.map] as const
}