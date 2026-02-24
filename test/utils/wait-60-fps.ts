import type { Game } from "@";

/**
 * Util func for wait game in 60 fps
 * @param game - Game reference
 * @param time - Time in ms
 * @returns { void }
 */
export async function wait60fps(game: Game, time: number): Promise<void> {
    game.start(60)

    await new Promise((resolve) => setTimeout(resolve, time))

    game.stop()
}

/**
 * Wait 60 fps seconds constants
 */
export const TIMES_60 = {
    TWO_SECONDS: 2000,
    FIVE_SECONDS: 5000,
    TEN_SECONDS: 10000
}