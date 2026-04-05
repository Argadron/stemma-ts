export interface IAsyncMapValues {
    /**
     * Promise resolver function
     * @param v - Always true
     * @returns { void }
     */
    readonly resolver: (v: true) => void;

    /**
     * Unsubscriber func
     */
    readonly unSub: VoidFunction;
}