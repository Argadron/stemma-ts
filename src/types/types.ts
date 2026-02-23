import { GameObjectEnum, type GameEvent } from "@enums"
import type { IEventInfo, IGameOptions, IItem, IWorldItem } from "@interfaces"
import type { Entity, GameObject } from "@world"

export type Position = [number, number]
export type Quad = [number, number, number, number]
export type AnyPosition = Position | Quad
export type EventCallback<T> = (options: IGameOptions, event: keyof typeof GameEvent, eventInfo: IEventInfo<T>) => void
export type CustomEventCallback<T> = (options: IGameOptions, event: string, eventInfo: IEventInfo<T>) => void;
export type CreateItemMetadata = Pick<IItem, 'damageBuff' | 'healthBuff' | 'walkBuff' | 'weight'>
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
export type CreateTowerMetadata = { damage: number }
export type CreateChestMetadata = { items: (IWorldItem | number)[] }
export type CreateTriggerMetadata = { trigger: (e: Entity, o: GameObject) => void, real: GameObjectEnum.BLOCK | GameObjectEnum.WALL } 