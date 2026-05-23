import type { Game } from "@core";
import type { IGlobalStateChangedData } from "@interfaces";
import type { State, StateCallback } from "@types";

/**
 * This hook allows you to React-like style 
 * manage your global state
 * @param key - Key in state to manage
 * @param initialValue - Initial value, if needed
 * @param core - Game reference (if hydration disabled)
 * @returns { State } - Actual state, function to update him and func to unsubscribe
 * @example 
 * const [isNight, setIsNight] = useState<boolean>('isNight', false)
 * 
 * if (isNight.value) console.log('No! It`s day! Its will never executed')
 * 
 * setIsNight(true) // set to true
 * 
 * console.log(isNight.value) // true
 * 
 * setIsNight((prev) => !prev)
 * 
 * if (!isNight.value) console.log('It`s night again!')
 */
export function useState<T = any>(key: string, initialValue?: T, core?: Game): State<T> {
    const game = useState.prototype.game as Game || core
    const store = game.options.store

    if (initialValue) store.set(key, initialValue)

    const getter = () => store.get(key) as T

    let value = getter()

    if (!value) throw new Error(`[useState]: value is undefined by key ${key}`)

    function setter(value: T): T
    function setter(cb: StateCallback<T>): T
    function setter(cbOrV: StateCallback<T> | T) {
        let result: T;

        if (typeof cbOrV === 'function') {
            const realCallback = cbOrV as StateCallback<T>

            result = realCallback(getter())
        }
        else result = cbOrV

        store.set(key, result)

        return result
    }

    const unSub = game.on<IGlobalStateChangedData>('globalStateChanged', (o, e, d) => {
        if (d.eventData.key !== key) return;
        else value = d.eventData.newValue
    })

    const realValue = {
        get value() {
            return value
        }
    }

    return [realValue, setter, unSub] as const
}