import type { GameObjectEnum } from "@enums";
import type { Position } from "@types";

export interface IGameObject extends Pick<ITarget, 'position' | 'name'> {
    readonly type: GameObjectEnum;
    readonly metadata?: any;
}

export interface IWorldItem extends IItem {
    readonly position: Position;
}

export interface ITarget {
    position: Position;
    health: number;
    damage: number;
    isDead: boolean;
    name: string;
}

export interface IItem {
    readonly id: number;
    readonly name: string;
    readonly isActive: boolean;
    readonly damageBuff?: number;
    readonly healthBuff?: number;
    readonly walkBuff?: number;
}