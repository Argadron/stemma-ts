import type { IGlobalStateChangedData, IGlobalStore, IGlobalStoreOptions } from "@interfaces";
import type { CommandContext } from "@types";

export class GlobalStore implements IGlobalStore {
    private readonly state = new Map<string, any>()
    private readonly options: IGlobalStoreOptions;

    public constructor(options: IGlobalStoreOptions) {
        if (typeof options.initialValue === 'object') {
            for (const key of Object.keys(options.initialValue)) {
                this.state.set(key, options.initialValue[key])
            }
        }

        this.options = options
    }

    public set<T = any>(key: string, value: T) {
        const oldValue = this.state.get(key)

        if (oldValue === value) return value;

        this.state.set(key, value)
        this.options.game.processEvent<IGlobalStateChangedData>('globalStateChanged', {
            eventTime: this.options.game.currentTick,
            eventData: {
                key,
                newValue: value,
                oldValue
            }
        })

        return value
    }

    public get<T = any>(key: string) {
        return this.state.get(key) as T
    }

    public getAll<T extends CommandContext = CommandContext>(): T {
        return Object.fromEntries(this.state.entries()) as T
    }

    public delete(key: string, emit=false) {
        const oldValue = this.state.get(key)
        const result = this.state.delete(key)

        if (emit) this.options.game.processEvent<IGlobalStateChangedData>('globalStateChanged', {
            eventTime: this.options.game.currentTick,
            eventData: {
                key,
                oldValue,
                newValue: null
            }
        })

        return result
    }
}