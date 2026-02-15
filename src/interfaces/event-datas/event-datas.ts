import type { IGameObject, ITarget, IWorldItem } from "@interfaces";
import type { Position, AnyPosition } from "@types";
import type { Entity } from "@world";

export interface IEventInfo<T> {
    readonly eventData: T;
    readonly eventTime: Date;
    readonly entity?: Entity;
}

export interface IAttackData {
    readonly victims: Entity[];
    readonly attacker: Entity;
}

export interface IDeadData {
    readonly entity: Entity;
    readonly killer: Entity | Object;
}

export interface IMovedData {
    readonly entity: Entity;
    readonly startPosition: Position;
    readonly newPosition: AnyPosition;
}

export interface IMovedCollisionData {
    readonly entity: Entity;
    readonly startPosition: Position;
    readonly collisionPosition: AnyPosition;
}

export interface IObjectCreatedCollisionData {
    readonly object: IGameObject;
}

export interface IEntityCreatedCollisionData {
    readonly target: ITarget;
}

export interface IEntityMovedOutOfRangeData {
    readonly tryMoveTo: Position;
}

export interface IObjectCreatedErrorData<T = any> {
    readonly mailformedMetadata: Partial<T>;
    readonly objectId: number;
}

export interface IItemPickedUpData {
    readonly item: IWorldItem;
}

export interface IItemPickedUpErrorData {
    readonly reason: 'NOT FOUND' | 'OUT OF REACH'| 'ITEM MAILFORMED';
    readonly position: Position;
}