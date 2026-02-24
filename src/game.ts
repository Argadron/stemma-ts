import { FactoryKeys, type GameEvent } from "@enums";
import type { IGame, IGameOptions, IEventInfo, ISnapshot } from "@interfaces";
import { EntityManager } from "@";
import type { EventCallback, CustomEventCallback, SnapshotCallback } from "@types";
import { BASE_FPS } from "@const";
import { EffectFactory } from "@factories";

export class Game implements IGame {
    readonly options: IGameOptions;

    /**
     * Flag indicates game start status
     */
    private isStarted = false;

    /**
     * ID of game interval loop
     */
    private gameIntervalId: number | undefined;
    
    /**
     * Map of GameEvents listeners
     */
    private readonly eventListenersMap = new Map<keyof typeof GameEvent, EventCallback<any>[]>()

    /**
     * Map of custom events listeners
     */
    private readonly customEventListenersMap = new Map<string, CustomEventCallback<any>[]>()

    /**
     * Factories in game context
     */
    private readonly factories = new Map<string, any>()

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
        this.connectFactory(FactoryKeys.EFFECTS, new EffectFactory())
    }

    public on<T>(event: keyof typeof GameEvent, cb: EventCallback<T>) {
        const events = this.eventListenersMap.get(event) ?? []

        events.push(cb)

        this.eventListenersMap.set(event, events)

        return () => {
            const events = this.eventListenersMap.get(event)

            if (events) {
                const filtrated = events.filter((subscriber) => subscriber !== cb)

                if (filtrated.length !== 0) this.eventListenersMap.set(event, filtrated)
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

                if (filtrated.length !== 0) this.customEventListenersMap.set(event, filtrated)
                else this.customEventListenersMap.delete(event)
            }
        }
    }

    public connectFactory<T = any>(name: string, factory: T) {
        this.factories.set(name, factory)

        return factory
    }

    public getFactory<T>(name: string) {
        return this.factories.get(name) as T
    }

    public save(cb?: SnapshotCallback): ISnapshot {
        const snapshot = {
            entities: this.options.entites.targets.map((e) => e.toDTO()),
            objects: this.options.map.objects.map((o) => o.toDTO())
        }
        
        if (cb) cb(snapshot)

        return snapshot
    }

    public load(snapshot: ISnapshot, onLoad?: (game: Game) => void) {
        this.options.map.load(snapshot.objects)
        this.options.entites.manager.load(snapshot.entities)

        if (onLoad) onLoad(this)
    }

    public start(fps=BASE_FPS) {
        if (this.isStarted) return false

        this.isStarted = true
        this.gameIntervalId = setInterval(() => {
            this.options.entites.targets.forEach((entity) => entity.tick())
            this.options.map.objects.forEach((object) => object.tick())
        }, 1000/fps)
        this.processEvent<null>('gameStarted', {
            eventTime: new Date(),
            eventData: null
        })

        return true
    }

    public stop() {
        if (!this.isStarted || !this.gameIntervalId) return false

        clearInterval(this.gameIntervalId)

        this.gameIntervalId = undefined
        this.isStarted = false
        this.processEvent<null>('gameStopped', {
            eventTime: new Date(),
            eventData: null
        })

        return true
    }
}
