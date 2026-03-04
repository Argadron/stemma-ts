import type { ISnapshot } from "@interfaces";

/**
 * Snapshot callback, optional parameter for snapshot data manipulate
 */
export type SnapshotCallback = (snapshot: ISnapshot) => void;