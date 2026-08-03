import type { Game } from "@core";
import type { IGlobalStateChangedData, Signal, SignalOptions } from "@interfaces";
import type { SignalHash } from "@types";
import { createId } from "@utils";

/**
 * This hook need to create signals
 * @param options - Options to create signal
 * @param core - Game reference, if hydration disabled
 * @returns { Signal } - A new signal
 */
export function useSignal(options?: SignalOptions, core?: Game): Signal {
    const game = useSignal.prototype.game as Game || core
    const signalHash = `signal_${createId()}_${game.currentTick}` satisfies SignalHash
    const store = game.options.store

    const listeners = [...options?.links ?? []]
    
    const unSub = options?.trigger ? game.on<IGlobalStateChangedData>('globalStateChanged', (opts, ev, data) => {
        if (data.eventData.key === signalHash && data.eventData.newValue === options?.trigger) signal(data)
    }) : undefined
    const signal = <T>(...args: T[]) => {
        listeners.forEach(cb => cb(...args))

        if (options?.once) {
            if (unSub) unSub()

            store.delete(signalHash)
        }
    }

    return {
        hash: signalHash,
        signal,
        unSub,
        sub: (fn: Function) => listeners.push(fn)
    }
}