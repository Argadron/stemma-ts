import type { GameObjectEnum } from "@enums";
import type { Position } from "@types";
import type { Entity } from "@world";

export interface IGameObject extends Pick<ITarget, 'position' | 'name'> {
    /**
     * Type of GameObject
     */
    readonly type: GameObjectEnum;

    /**
     * Any object metadata for create. See CreateItemMetadata, CreateTowerMetadata, etc.
     */
    readonly metadata?: any;

    /**
     * Internal object id. Will be generated automatic
     */
    readonly id?: number;

    /**
     * ID for execute iteract script
     */
    readonly iteractionId?: number | undefined;
}

export interface IWorldItem extends IItem {
    /**
     * Item position on world
     */
    readonly position: Position;
}

export interface ITarget {
    /**
     * Target position in world
     */
    position: Position;

    /**
     * Target health
     */
    health: number;

    /**
     * Target damage
     */
    damage: number;

    /**
     * Flag indicate, target is dead or not
     */
    isDead: boolean;

    /**
     * Target name
     */
    name: string;
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

export interface IChest {
    /**
     * Items in chest
     */
    readonly items: IItem[]
}

export interface IEffect {
    /**
     * Optional effect power
     */
    readonly power?: number;

    /**
     * Effect name
     */
    readonly name: string;

    /**
     * What will do in next game tick (effect actions)
     * @param e - Entity, who has this effec
     * @returns { void }
     */
    readonly onTick: (e: Entity, effect: IEffect) => void;

    /**
     * What will do when effect end
     * @param e - Entity who has effect
     * @returns { void }
     */
    readonly onEnd?: (e: Entity, effect: IEffect) => void;
}

export interface IGameEffect extends IEffect {
    /**
     * ID of effect
     */
    readonly id: number;
}