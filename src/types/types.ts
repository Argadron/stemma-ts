import type { Game } from "@"
import { GameObjectEnum, type GameEvent } from "@enums"
import type { ICommand, IEventInfo, IGameObject, IGameOptions, IItem, ISnapshot, ITarget, IWorldItem } from "@interfaces"
import type { Entity, GameObject } from "@world"

/**
 * Position type. Base 2D position
 */
export type Position = [number, number]

/**
 * Quad type. (x1y1x2y2)
 */
export type Quad = [number, number, number, number]

/**
 * AnyPosition type. Can be position, or quad (unknown)
 */
export type AnyPosition = Position | Quad

/**
 * Event callback, will be executed when any event executing
 */
export type EventCallback<T> = (options: IGameOptions, event: keyof typeof GameEvent, eventInfo: IEventInfo<T>) => void

/**
 * Custom event callback, will be executed when any custom event executing
 */
export type CustomEventCallback<T> = (options: IGameOptions, event: string, eventInfo: IEventInfo<T>) => void;

/**
 * Metadata for create Item object type
 */
export type CreateItemMetadata = Pick<IItem, 'damageBuff' | 'healthBuff' | 'walkBuff' | 'weight'>

/**
 * Metadata for create usable item object type
 */
export type CreateUsableItemMetadata = CreateItemMetadata & { 
    /**
     * Callback with actions with entity, etc... 
     * Item WILL BE DELETED AUTOMATIC after executing callback
     * @param e - Entity context
     * @returns { void } - Any actions on item using...
     * @example
     * onUse(e) => {
     *   e.damage += 1
     *   e.healht -= 1
     * }
     */
    readonly onUse: (e: Entity) => void,
    readonly isConsumable?: boolean;
}

/**
 * Metadata for create Tower object type
 */
export type CreateTowerMetadata = { damage: number }

/**
 * Metadata for create Chest object type
 */
export type CreateChestMetadata = { items: (IWorldItem | number)[] }

/**
 * Metadata for create Trigger object type.
 * isSensor - send triggerSensorActive event in next game tick
 * scanInterval - optional parameter for sensors (interval for checks in ticks)
 */
export type CreateTriggerMetadata = { trigger: (e: Entity, o: GameObject) => void, real: GameObjectEnum.BLOCK | GameObjectEnum.WALL, isSensor?: boolean; scanInterval?: number } 

/**
 * Snapshot callback, optional parameter for snapshot data manipulate
 */
export type SnapshotCallback = (snapshot: ISnapshot) => void;

/**
 * Util type for blueprint content
 */
export type BlueprintContent = Omit<ITarget, 'position'> | Omit<IGameObject, 'position'>

/**
 * Middleware function type
 */
export type MiddlewareFn = (command: ICommand, next: VoidFunction, game: Game, ctx: Record<string, any>) => void;

/**
 * Grid position type
 */
export type GridPosition = `${number}:${number}`