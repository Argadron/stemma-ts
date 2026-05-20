export interface IAsyncState<T = any> {
    /**
     * Key to observe
     */
    readonly key: string;

    /**
     * Value, need to set status true
     */
    readonly value: T;

    /**
     * Dynamic updating status
     */
    readonly status: boolean
}