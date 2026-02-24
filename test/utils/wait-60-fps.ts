import type { Game } from "@";

export async function wait60fps(game: Game, time: number) {
    game.start(60)

    await new Promise((resolve) => setTimeout(resolve, time))

    game.stop()
}

export const TIMES_60 = {
    TWO_SECONDS: 2000,
    FIVE_SECONDS: 5000,
    TEN_SECONDS: 10000
}