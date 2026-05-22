import { ASYNC_STATE_DEFAULT_WAIT } from "@const";
import type { Game } from "@core";
import type { IAsyncState } from "@interfaces";

/**
 * Wait state in key will be equal value
 * @param key - Key to wait
 * @param value - Excepted value
 * @param waitTime - Time before new check state
 * @param maxRetries - Max retries if need, or provide -1 (default)
 * @param core - Game reference to extract store (if hydration disabled)
 * @returns { IAsyncState } - Async state promise ( resolve when state is equal )
 */
export function useAsyncState<T = any>(key: string, value: T, waitTime?: number, maxRetries=-1, core?: Game): Promise<IAsyncState<T>> {
    const game = useAsyncState.prototype.game as Game || core
    const store = game.options.store

    return new Promise((resolve, reject) => {
        const isStoreStateEqual = () => store.get<T>(key) === value

        if (isStoreStateEqual()) return resolve({
            key,
            value,
            status: true
        })
        else {
            const patchingState = {
                key,
                value,
                status: false
            }

            let currentRetry = 0;

            async function isStateEqual() {
                try {
                    currentRetry++

                    if (isStoreStateEqual()) {
                        patchingState.status = true
                    
                        resolve(patchingState)
                    }
                    else throw new Error()
                } catch {
                    if (maxRetries !== -1 && currentRetry === maxRetries) return reject(`Max retries occured for ${key}`)

                    await new Promise((resolve) => setTimeout(resolve, waitTime ?? ASYNC_STATE_DEFAULT_WAIT))

                    isStateEqual()
                }
            }

            isStateEqual()

            return patchingState
        }
    })
}