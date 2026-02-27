import { CommandType, FactoryKeys, type GameEvent } from "@enums";
import type { IGame, IGameOptions, IEventInfo, ISnapshot, ICommand } from "@interfaces";
import { EntityManager} from "@";
import type { EventCallback, CustomEventCallback, SnapshotCallback, MiddlewareFn } from "@types";
import { BASE_FPS } from "@const";
import { BluePrintsFactory, EffectFactory, IteractionsFactory, QuestsFactory, SoundsFactory } from "@factories";
import { GlobalStore } from "@store";

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
     * Current game tick
     */
    private _currentTick = 0;
    
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

    /**
     * Array of game middlewares
     */
    private readonly middlewares: MiddlewareFn[] = []

    private kernelExecute(command: ICommand) {
            switch(command.type) {
                case CommandType.SET_STATE:
                    this.options.store.set(command.data.key, command.data.value)
                    break
                case CommandType.CREATE_ENTITY:
                    this.options.entites.manager.create(command.data.target)
                    break
                
                default: 
                    const entity = this.options.entites.manager.get(command.entityId!)

                    if (!entity) return
                    else {
                        switch (command.type) {
                            case CommandType.ATTACK:
                                entity.attack(command.data.entities)
                                break
                            case CommandType.APPLY_EFFECT:
                                entity.applyEffect(command.data.effect, command.data.duration)
                                break
                
                            case CommandType.DROP_INVENTORY:
                                entity.dropInventory()
                                break
                            case CommandType.DROP_ITEM:
                                entity.dropItem(command.data.item, command.data.position)
                                break
                            case CommandType.EQUIP_ITEM:
                                entity.equipItem(command.data.item)
                                break
                            case CommandType.INTERACT_POSITION:
                                entity.interactPosition(command.data.position)
                                break
                            case CommandType.MOVE:
                                entity.move(command.data.position)
                                break
                            case CommandType.OPEN_CHEST:
                                entity.openChest(command.data.position)
                                break
                            case CommandType.PICKUP:
                                entity.pickUp(command.data.position)
                                break
                            case CommandType.USE_ITEM:
                                entity.useItem()
                                break
                            default:
                                throw new Error(`[Game]: Unknown command type ${command.type}`)
                        }
                    }
            }
    }

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
            store: new GlobalStore({ game: this }),
            ...options
        }
        this.connectFactory(FactoryKeys.EFFECTS, new EffectFactory())
        this.connectFactory(FactoryKeys.BLUEPRINTS, new BluePrintsFactory({ game: this }))
        this.connectFactory(FactoryKeys.QUESTS, new QuestsFactory({ game: this }))
        this.connectFactory(FactoryKeys.ITERACTIONS, new IteractionsFactory({ game: this }))
        this.connectFactory(FactoryKeys.SOUNDS, new SoundsFactory({ game: this }))
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

    public use(middleware: MiddlewareFn | MiddlewareFn[]) {
        if (Array.isArray(middleware)) {
            for (const middlw of middleware) this.middlewares.push(middlw)
        }
        else this.middlewares.push(middleware)
    }

    public dispatch(command: ICommand) {
        const ctx = {}

        let index = 0;

        const next = () => {
            const middleware = this.middlewares[index++]

            if (middleware) middleware(command, next, this, ctx)
            else this.kernelExecute(command)
        }

        next()
    }

    public start(fps=BASE_FPS) {
        if (this.isStarted) return false

        this.isStarted = true
        this.gameIntervalId = setInterval(() => {
            this._currentTick ++

            this.options.entites.targets.forEach((entity) => entity.tick())
            this.options.map.objects.forEach((object) => object.tick())
        }, 1000/fps)
        this.processEvent<null>('gameStarted', {
            eventTime: this._currentTick,
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
            eventTime: this._currentTick,
            eventData: null
        })

        return true
    }

    /**
     * Returns a current game tick
     */
    public get currentTick() {
        return this._currentTick
    }
}
