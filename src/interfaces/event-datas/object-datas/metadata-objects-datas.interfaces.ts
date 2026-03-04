import type { IChest, IItem, IWorldItem } from "@interfaces";
import type { Position } from "@types";
import type { Entity, GameObject } from "@world";

export interface ITowerShootedData {
    readonly tower: GameObject;
    readonly deathsCount: number;
    readonly victims: Entity[];
}

export interface IChestOpenErrorData {
    /**
     * Chest reference
     */
    readonly chest?: IChest;

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