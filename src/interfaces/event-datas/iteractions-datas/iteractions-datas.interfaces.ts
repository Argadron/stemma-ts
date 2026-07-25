import type { EntityManager } from "@core";
import type { IGameSound } from "@interfaces";
import type { AnyPosition, GeometryTypes, Position, Position3D } from "@types";
import type { Entity, GameObject } from "@world";

export interface IAttackData<G extends GeometryTypes='2D'|'3D', P extends Position | Position3D=Position | Position3D> {
    /**
     * Array of victims in attack
     */
    readonly victims: Entity[];

    /**
     * Attacker in event
     */
    readonly attacker: Entity | GameObject | EntityManager<G, P>;
}

export interface IDeadData<G extends GeometryTypes='2D'|'3D', P extends Position | Position3D=Position | Position3D> {
    /**
     * Entity, who dead
     */
    readonly entity: Entity;

    /**
     * Killer, who kill entity
     */
    readonly killer: Entity | GameObject | EntityManager<G, P>;
}

export interface IMovedData {
    /**
     * Entity who moved
     */
    readonly entity: Entity;

    /**
     * Entity start position
     */
    readonly startPosition: Position | Position3D;

    /**
     * Entity position after move
     */
    readonly position: AnyPosition;
}

export interface IPlaySoundData {
    readonly sound: IGameSound;
    readonly position?: Position | undefined;
}