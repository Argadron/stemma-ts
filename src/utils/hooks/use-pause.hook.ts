import { USE_PAUSE_STATE_KEY } from "@const";
import type { Game } from "@core";
import type { IAsyncState } from "@interfaces";
import { useAsyncState } from '@utils';

/**
 * Pause client command executing 
 * Pause has ~1 MS mistake
 * @param time - Time to pause in MS
 * @param delay - If time <1000 MS, you can overrite delay to check
 * @param take - If time <1000 MS, you can overrite take
 * @param core - Game reference
 * @returns { Promise<IAsyncState<number>> } - Async state
 */
export function usePause(time: number, delay=1000, take=1000, core?: Game): Promise<IAsyncState<number>> {
    const game = usePause.prototype.game as Game || core

    game.use((cmd, next, g) => {
        if (g.options.store.get(USE_PAUSE_STATE_KEY) <= 0) return next()
        else if (cmd.isSystem) return next()
        else throw new Error('block by use pause')
    })
    game.options.store.set(USE_PAUSE_STATE_KEY, time)

    const originalTime = time
    const interval = setInterval(() => {
        game.options.store.set(USE_PAUSE_STATE_KEY, time -= take)

        console.log(time)
        if (time === 0) clearInterval(interval)
    }, delay-0.0001)

    return useAsyncState(USE_PAUSE_STATE_KEY, 0, originalTime+1, 5)
}
