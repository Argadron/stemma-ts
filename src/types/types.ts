import type { GameEvent } from "@enums"
import type { IEventInfo, IGameOptions, IItem } from "@interfaces"
import type { Entity } from "@world"

export type Position = [number, number]
export type Quad = [number, number, number, number]
export type AnyPosition = Position | Quad
export type EventCallback<T> = (options: IGameOptions, event: keyof typeof GameEvent, eventInfo: IEventInfo<T>) => void
export type CustomEventCallback<T> = (options: IGameOptions, event: string, eventInfo: IEventInfo<T>) => void;
export type CreateItemMetadata = Pick<IItem, 'damageBuff' | 'healthBuff' | 'walkBuff'>
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
    onUse: (e: Entity) => void 
}
export type CreateTowerMetadata = { damage: number }