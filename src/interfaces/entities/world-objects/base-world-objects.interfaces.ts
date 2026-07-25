import type { GameObjectEnum } from "@enums";
import type { IItem } from "@interfaces";
import type { Position, Position3D } from "@types";

export interface ITarget<T extends Position | Position3D = Position | Position3D> {
    /**
     * Target position in world
     */
    position: T;

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

export interface IGameObject<T = any, P extends Position | Position3D = Position | Position3D> extends Pick<ITarget<P>, 'position' | 'name'> {
    /**
     * Type of GameObject
     */
    readonly type: GameObjectEnum;

    /**
     * Any object metadata for create. See CreateItemMetadata, CreateTowerMetadata, etc.
     */
    readonly metadata?: T;

    /**
     * Internal object id. Will be generated automatic
     */
    readonly id?: number;

    /**
     * ID for execute iteract script
     */
    readonly iteractionId?: number | undefined;
}