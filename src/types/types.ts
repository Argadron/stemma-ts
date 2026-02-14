import type { GameEvent } from "@enums"
import type { IEventInfo, IGameOptions, IItem } from "@interfaces"

export type Position = [number, number]
export type Quad = [number, number, number, number]
export type AnyPosition = Position | Quad
export type EventCallback<T> = (options: IGameOptions, event: keyof typeof GameEvent, eventInfo: IEventInfo<T>) => void
export type CustomEventCallback<T> = (options: IGameOptions, event: string, eventInfo: IEventInfo<T>) => void;
export type CreateItemMetadata = Pick<IItem, 'damageBuff' | 'healthBuff' | 'walkBuff'>