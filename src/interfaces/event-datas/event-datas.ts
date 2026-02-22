import type { IChest, IItem, ITarget, IWorldItem } from "@interfaces";
import type { Position, AnyPosition } from "@types";
import type { Entity, GameObject } from "@world";

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
    readonly killer: Entity | GameObject;
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
    readonly object: GameObject;
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

export interface IChestOpenErrorData {
    readonly chest: IChest;
    readonly reason: 'NOT FOUND' | 'OUT OF REACH' | 'CHEST MAILFORMED';
    readonly position: Position;
}

export interface IChestOpenedData {
    readonly chest: IChest;
}

export interface IItemPickedUpData {
    readonly item: IWorldItem;
}

export interface IItemPickedUpErrorData {
    readonly reason: 'NOT FOUND' | 'OUT OF REACH'| 'ITEM MAILFORMED';
    readonly position: Position;
}

export interface IItemDroppedErrorData {
    readonly item?: IWorldItem;
    readonly reason: 'NOT FOUND' | 'COLLISION';
    readonly position: Position;
}

export interface IItemDroppedData {
    readonly item: IWorldItem;
    readonly position: Position;
}

export interface IItemUsedData {
    readonly item: IItem;
}