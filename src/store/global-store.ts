import type { IGlobalStateChangedData, IGlobalStore, IGlobalStoreOptions } from "@interfaces";

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
            eventTime: new Date(),
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
}