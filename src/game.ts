import type { GameEvent } from "@enums";
import type { IGame, IGameOptions, IEventInfo } from "@interfaces";
import { EntityManager } from "@";
import type { EventCallback, CustomEventCallback } from "@types";
import { BASE_FPS } from "@const";

export class Game implements IGame {
    readonly options: IGameOptions;

    /**
     * Flag indicates game start status
     */
    private isStarted = false;
    
    /**
     * Map of GameEvents listeners
     */
    private readonly eventListenersMap = new Map<keyof typeof GameEvent, EventCallback<any>[]>()

    /**
     * Map of custom events listeners
     */
    private readonly customEventListenersMap = new Map<string, CustomEventCallback<any>[]>()

    public constructor(
        options?: IGameOptions
    ) {
        const manager = new EntityManager([], this)

        this.options = {
            entites: {
                manager,
                targets: manager.entites
            },
            map: manager.gameMap,
            ...options
        }
    }

    public on<T>(event: keyof typeof GameEvent, cb: EventCallback<T>) {
        const events = this.eventListenersMap.get(event) ?? []

        events.push(cb)

        this.eventListenersMap.set(event, events)

        return () => {
            const events = this.eventListenersMap.get(event)

            if (events) {
                const filtrated = events.filter((subscriber) => subscriber !== cb)

                if (filtrated.length !== 0) this.eventListenersMap.set(event, events)
                else this.eventListenersMap.delete(event)
            }
        }
    }

    public processEvent<T>(event: keyof typeof GameEvent, eventData: IEventInfo<T>) {
        const subscribers = this.eventListenersMap.get(event)

        if (subscribers) subscribers.forEach((cb) => cb(this.options, event, eventData))
    }

    public processCustomEvent<T>(event: string, eventData: IEventInfo<T>) {
        const subscribers = this.customEventListenersMap.get(event)

        if (subscribers) subscribers.forEach((cb) => cb(this.options, event, eventData))
    }

    public registerCustomEvent<T>(event: string, cb: CustomEventCallback<T>) {
        const events = this.customEventListenersMap.get(event) ?? []

        events.push(cb)

        this.customEventListenersMap.set(event, events)

        return () => {
            const events = this.customEventListenersMap.get(event)

            if (events) {
                const filtrated = events.filter((subscriber) => subscriber !== cb)

                if (filtrated.length !== 0) this.customEventListenersMap.set(event, events)
                else this.customEventListenersMap.delete(event)
            }
        }
    }

    public start(fps=BASE_FPS) {
        if (this.isStarted) return false

        this.isStarted = true

        setInterval(() => {
            console.log(fps)
        }, 1000/fps)
    }
}
