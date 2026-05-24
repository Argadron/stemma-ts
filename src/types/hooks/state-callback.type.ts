/**
 * Type defines callback with preview state, returns new state
 */
export type StateCallback<T = any> = (state: T) => T

/**
 * State setter callback type, provide prev state into callback,
 * accept new state
 */
export type StateSetterCallback<T = any> = (cb: StateCallback<T>) => T

/**
 * State type, returns array of object with current value state,
 * function to update state,
 * function to unSub from state
 */
export type State<T = any> = [{ readonly value: T }, ((value: T) => T) & StateSetterCallback<T>, VoidFunction]