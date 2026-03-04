import type { Position } from "@types";

export interface IWorldItem extends IItem {
    /**
     * Item position on world
     */
    readonly position: Position;
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