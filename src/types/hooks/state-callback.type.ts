export type StateCallback<T = any> = (state: T) => T
export type StateSetterCallback<T = any> = (cb: StateCallback<T>) => T
export type State<T = any> = [{ readonly value: T }, ((value: T) => T) & StateSetterCallback<T>, VoidFunction]