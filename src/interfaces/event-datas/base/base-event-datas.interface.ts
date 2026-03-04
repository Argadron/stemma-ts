import type { Entity, GameObject } from "@world";

export interface IEventInfo<T> {
    /**
     * Any event data for curent event
     */
    readonly eventData: T;

    /**
     * Time (tick), when event did execute
     */
    readonly eventTime: number;

    /**
     * Entity trigger event, if exists
     */
    readonly entity?: Entity | GameObject;
}
