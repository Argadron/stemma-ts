import type { Default, SignalHash } from "@types";

export interface Signal {
    /**
     * Hash string of this signal
     */
    readonly hash: SignalHash;

    /**
     * Function to activate signal
     */
    readonly signal: <T>(...args: T[]) => void;

    /**
     * Reference to game unsub event function
     */
    readonly unSub: VoidFunction | undefined;

    /**
     * Signal sub func
     */
    readonly sub: (fn: Function) => number;
}

export interface SignalOptions<T = any> {
    /**
     * Subscribers, will be activated after signal used
     */
    readonly links?: Function[];

    /**
     * Trigger key, signal will be activeated, when
     * value in hash will be equals this key
     */
    readonly trigger?: Default<T>;

    /**
     * If true, signal will be destroyed after first activate
     */
    readonly once?: boolean;
}