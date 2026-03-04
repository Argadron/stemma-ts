import type { ITarget } from "@interfaces";
import type { Position } from "@types";

export interface IEntityCreatedData {
    readonly fromTarget: ITarget;
}

export interface IEntityTagsChangedData {
    readonly tag: string;
    readonly type: 'DELETE' | 'ADD';
}

export interface IEntityMovedOutOfRangeData {
    /**
     * Position out of range from entity current position
     */
    readonly tryMoveTo: Position;
}