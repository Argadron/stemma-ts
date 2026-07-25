import type { Position, Position3D } from "@types";

export interface IWorldItem<T extends Position | Position3D = Position | Position3D> extends IItem {
    /**
     * Item position on world
     */
    readonly position: T;
}

export interface IItem<T = any> {
    /**
     * ID of item
     */
    readonly id: number;

    /**
     * Item name
     */
    readonly name: string;

    /**
     * Damage buff from Item (calc of real damage + damageBuff)
     */
    readonly damageBuff?: number;

    /**
     * Health buff from Item (calc of real health + healthBuff)
     */
    readonly healthBuff?: number;

    /**
     * Walk buff from Item (calc of base walk + walkBuff)
     */
    readonly walkBuff?: number;

    /**
     * Item weight
     */
    readonly weight?: number;

    /**
     * Any metadata for internal process
     */
    readonly metadata?: T
}