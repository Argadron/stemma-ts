import type { IBaseFactoriesOptions, ISnapshot } from "@interfaces";

export interface IUndoManager {
    /**
     * Push snapshot to history
     * @param snapshot - Snapshot to push
     * @returns { void }
     */
    readonly push: (snapshot: ISnapshot) => void;

    /**
     * Get back to one step
     * @returns { void }
     */
    readonly undo: () => void;

    /**
     * Discard changes by undo
     * @returns { void }
     */
    readonly redo: () => void;
}

export interface IUndoManagerOptions extends IBaseFactoriesOptions {
    readonly historyLimit?: number;
}