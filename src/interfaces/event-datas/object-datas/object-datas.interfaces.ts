import type { GameObject } from "@world";

export interface IObjectDeletedOrCreatedData {
    readonly object: GameObject;
}

export interface IObjectCreatedErrorData<T = any> {
    /**
     * Any mailformedMetadata when object creating
     */
    readonly mailformedMetadata: Partial<T>;

    /**
     * Object ID to manipulation
     */
    readonly objectId: number;
}