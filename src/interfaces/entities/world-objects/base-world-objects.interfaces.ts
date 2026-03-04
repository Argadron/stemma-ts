import type { GameObjectEnum } from "@enums";
import type { IItem } from "@interfaces";
import type { Position } from "@types";

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

export interface IChest {
    /**
     * Items in chest
     */
    readonly items: IItem[]
}

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