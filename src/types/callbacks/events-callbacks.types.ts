import type { GameEvent } from "@enums";
import type { IEventInfo, IGameOptions } from "@interfaces";

/**
 * Event callback, will be executed when any event executing
 */
export type EventCallback<T> = (options: IGameOptions, event: keyof typeof GameEvent, eventInfo: IEventInfo<T>) => void

/**
 * Custom event callback, will be executed when any custom event executing
 */
export type CustomEventCallback<T> = (options: IGameOptions, event: string, eventInfo: IEventInfo<T>) => void;