export interface IGlobalStateChangedData<T = any> {
    readonly key: string;
    readonly newValue: T;
    readonly oldValue: T;
}