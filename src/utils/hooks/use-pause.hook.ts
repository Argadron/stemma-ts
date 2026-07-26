import { USE_PAUSE_STATE_KEY } from "@const";
import type { Game } from "@core";
import type { IAsyncState } from "@interfaces";
import { useAsyncState } from '@utils';

const usePauseSymbol = Symbol(USE_PAUSE_STATE_KEY)

/**
 * Pause client command executing 
 * Pause has ~1 MS mistake
 * @param time - Time to pause in gameTicks (1 sec = 20 ticks)
 * @param core - Game reference
 * @returns { Promise<IAsyncState<number>> } - Async state
 */
export function usePause(time: number, core?: Game): Promise<IAsyncState<number>> {
    const game = usePause.prototype.game as Game || core
    const endTick = game.currentTick + time
    const gameAny = game as any

    if (!(gameAny)[usePauseSymbol]) {
        game.use((cmd, next, g) => {
            if (cmd.isSystem) return next()
            else {
                const target = g.options.store.get(USE_PAUSE_STATE_KEY) ?? 0

                if (g.currentTick >= target) {
                    if (target) g.options.store.set(USE_PAUSE_STATE_KEY, 0)

                    return next()
                }
            }
        })

        gameAny[usePauseSymbol] = true
    }

    game.options.store.set(USE_PAUSE_STATE_KEY, endTick)

    return useAsyncState(USE_PAUSE_STATE_KEY, 0, time*20, time < 5 ? 5 : Math.floor(time/10))
}
