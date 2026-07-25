import type { ITarget } from "@interfaces";
import type { AnyPosition, Position, Position3D } from "@types";
import type { Entity, GameObject } from "@world";

export interface IMovedCollisionData {
    /**
     * Entity who cant move
     */
    readonly entity: Entity;

    /**
     * Start entity position
     */
    readonly startPosition: Position | Position3D;

    /**
     * Collision position (entity cant moved to her)
     */
    readonly collisionPosition: AnyPosition;
}

export interface IObjectCreatedCollisionData {
    /**
     * Mailformed object. Not created correct
     */
    readonly object: GameObject;
}

export interface IEntityCreatedCollisionData {
    /**
     * Target data
     */
    readonly target: ITarget;
}