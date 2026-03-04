import type { EntityManager } from "@";
import type { IGameSound } from "@interfaces";
import type { AnyPosition, Position } from "@types";
import type { Entity, GameObject } from "@world";

export interface IAttackData {
    /**
     * Array of victims in attack
     */
    readonly victims: Entity[];

    /**
     * Attacker in event
     */
    readonly attacker: Entity | GameObject | EntityManager;
}

export interface IDeadData {
    /**
     * Entity, who dead
     */
    readonly entity: Entity;

    /**
     * Killer, who kill entity
     */
    readonly killer: Entity | GameObject | EntityManager;
}

export interface IMovedData {
    /**
     * Entity who moved
     */
    readonly entity: Entity;

    /**
     * Entity start position
     */
    readonly startPosition: Position;

    /**
     * Entity position after move
     */
    readonly newPosition: AnyPosition;
}

export interface IPlaySoundData {
    readonly sound: IGameSound;
    readonly position?: Position | undefined;
}