import type { IChest, IItem, ITarget, IWorldItem, IGameSound } from "@interfaces";
import type { Position, AnyPosition } from "@types";
import type { Entity, GameObject } from "@world";
import type { EntityManager } from "@"

export interface IEventInfo<T> {
    /**
     * Any event data for curent event
     */
    readonly eventData: T;

    /**
     * Time, when event did execute
     */
    readonly eventTime: Date;

    /**
     * Entity trigger event, if exists
     */
    readonly entity?: Entity | GameObject;
}

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

export interface IMovedCollisionData {
    /**
     * Entity who cant move
     */
    readonly entity: Entity;

    /**
     * Start entity position
     */
    readonly startPosition: Position;

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

export interface IEntityMovedOutOfRangeData {
    /**
     * Position out of range from entity current position
     */
    readonly tryMoveTo: Position;
}

export interface IObjectCreatedErrorData<T = any> {
    /**
     * Any mailformedMetadata when object creating
     */
    readonly mailformedMetadata: Partial<T>;

    /**
     * Object ID to manipulation
     */
    readonly objectId: number;
}

export interface IChestOpenErrorData {
    /**
     * Chest reference
     */
    readonly chest: IChest;

    /**
     * Reason, why entity cant open chest
     */
    readonly reason: 'NOT FOUND' | 'OUT OF REACH' | 'CHEST MAILFORMED';

    /**
     * Position, where entity try open chest
     */
    readonly position: Position;
}

export interface IChestOpenedData {
    /**
     * Chest reference
     */
    readonly chest: IChest;
}

export interface IItemPickedUpData {
    /**
     * Item reference
     */
    readonly item: IWorldItem;
}

export interface IItemPickedUpErrorData {
    /**
     * Any reason, why entity cant pick up item
     */
    readonly reason: 'NOT FOUND' | 'OUT OF REACH'| 'ITEM MAILFORMED';

    /**
     * Item position
     */
    readonly position: Position;
}

export interface IItemDroppedErrorData {
    /**
     * Item reference, undefined if item not exists in inventory
     */
    readonly item?: IWorldItem;

    /**
     * Reason, why entity cant drop item
     */
    readonly reason: 'NOT FOUND' | 'COLLISION';

    /**
     * Position to drop item
     */
    readonly position: Position;
}

export interface IItemDroppedData {
    /**
     * Item reference
     */
    readonly item: IWorldItem;

    /**
     * Position to drop item
     */
    readonly position: Position;
}

export interface ITriggerActivatedData {
    /**
     * Trigger reference
     */
    readonly trigger: GameObject;
}

export interface IItemUsedData {
    /**
     * Item reference
     */
    readonly item: IItem;
}

export interface IWorldObjectHearedNoiseData {
    /**
     * Entity who move and activate noise
     */
    readonly fromEntity: Entity;
}

export interface IGlobalStateChangedData<T = any> {
    readonly key: string;
    readonly newValue: T;
    readonly oldValue: T;
}

export interface IPlaySoundData {
    readonly sound: IGameSound;
    readonly position?: Position | undefined;
}