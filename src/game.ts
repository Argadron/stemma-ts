import { CommandType, FactoryKeys, type GameEvent } from "@enums";
import type { IGame, IGameOptions, IEventInfo, ISnapshot, ICommand, IInitGameOptions, IPlugin } from "@interfaces";
import { EntityManager, UndoManager} from "@";
import type { EventCallback, CustomEventCallback, SnapshotCallback, MiddlewareFn } from "@types";
import { BASE_FPS, BASE_MAX_COMMAND_EXECUTING_ON_TICK_LIMIT } from "@const";
import { BluePrintsFactory, EffectFactory, IteractionsFactory, QuestsFactory, SoundsFactory } from "@factories";
import { GlobalStore } from "@store";
import { baseChecksMiddleware, DropItemGuard, EntityInteractGuard, EquipItemGuard, MovementGuard, OpenChestGuard, PickUpGuard, ShootGuard, UseItemGuard } from "@middlewares";
import { extractMethodFromPlugin } from "@utils";

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
     * Plugins in current game context
     */
    private readonly plugins = new Map<string, IPlugin>()

    /**
     * Array of game middlewares
     */
    private readonly middlewares: MiddlewareFn[] = []

    /**
     * Array of commands waiting to execute
     */
    private readonly commandQueue: ICommand[] = [];

    /**
     * Internal kernel execute a cmd
     * @param command - Command to execute
     * @param ctx - Command context
     * @returns { void }
     */
    private kernelExecute(command: ICommand, ctx: Record<string, any>): void {
            switch(command.type) {
                case CommandType.SET_STATE:
                    this.options.store.set(command.data.key, command.data.value)
                    break
                case CommandType.CREATE_ENTITY:
                    this.options.entites.manager.create(command.data.target)
                    break
                case CommandType.CREATE_OBJECT:
                    this.options.map.createObject(command.data.object)
                    break
                
                default: 
                    const entity = this.options.entites.manager.get(command.entityId!)

                    if (command.type === CommandType.TOWER_SHOOT) {
                        this.options.map.getObject(command.objectId!)?.shoot()

                        return
                    }
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
                                entity.interactPosition(command.data.position, ctx.objects)
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
                            case CommandType.SET_ENTITY_TAG:
                                entity.addTag(command.data.tag)
                                break
                            case CommandType.DELETE_ENTITY_TAG:
                                entity.removeTag(command.data.tag)
                                break
                            default:
                                throw new Error(`[Game]: Unknown command type ${command.type}`)
                        }
                    }
            }
    }

    /**
     * Proccess a cmd
     * @param cmd - Cmd to process
     * @returns { void }
     */
    private proccessCmd(cmd: ICommand): void {
        this.options.undoManager.push(this.save())

        const ctx = {}

        if (!cmd.isSystem) {
            let index = 0;

            const next = () => {
                const middleware = this.middlewares[index++]

                if (middleware) middleware(cmd, next, this, ctx)
                else this.kernelExecute(cmd, ctx)
            }

            next()
        }
        else this.kernelExecute(cmd, ctx)
    }

    public constructor(
        options?: IInitGameOptions
    ) {
        const manager = new EntityManager([], this)

        this.options = {
            entites: {
                manager,
                targets: manager.entites
            },
            map: manager.gameMap,
            store: new GlobalStore({ game: this }),
            undoManager: new UndoManager({ game: this }),
            ...options
        }
        this.connectFactory(FactoryKeys.EFFECTS, new EffectFactory())
        this.connectFactory(FactoryKeys.BLUEPRINTS, new BluePrintsFactory({ game: this }))
        this.connectFactory(FactoryKeys.QUESTS, new QuestsFactory({ game: this }))
        this.connectFactory(FactoryKeys.ITERACTIONS, new IteractionsFactory({ game: this }))
        this.connectFactory(FactoryKeys.SOUNDS, new SoundsFactory({ game: this }))

        if (!(options?.disableBaseMiddleware)) this.use(baseChecksMiddleware)
        if (options?.usingEntityMiddlewares) this.use([DropItemGuard, EntityInteractGuard, EquipItemGuard, MovementGuard, OpenChestGuard, PickUpGuard, UseItemGuard])
        if (options?.usingObjectMiddlewares) this.use([ShootGuard])
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

    public registerPlugin(plugin: IPlugin) {
        const proto = Object.getPrototypeOf(plugin)

        if (proto.__events) proto.__events.forEach((e: { event: keyof typeof GameEvent, methodName: string }) => this.on(e.event, (o, ev, d) => {
            const method = extractMethodFromPlugin(plugin, e.methodName)

            if (method) method.call(plugin, d)
        })) 

        const installResult = plugin.install(this)

        if (installResult) {
            this.plugins.set(plugin.name, plugin)

            return true
        }
        else return false
    }

    public getPlugin(name: string) {
        return this.plugins.get(name)
    }

    public save(cb?: SnapshotCallback): ISnapshot {
        const snapshot = {
            entities: this.options.entites.targets.map((e) => e.toDTO()),
            objects: this.options.map.objects.map((o) => o.toDTO()),
            state: Object.fromEntries(this.options.store.state)
        }
        
        if (cb) cb(snapshot)

        return snapshot
    }

    public load(snapshot: ISnapshot, onLoad?: (game: Game) => void) {
        this.options.map.load(snapshot.objects)
        this.options.entites.manager.load(snapshot.entities)
        
        for (const key of Object.keys(snapshot.state)) this.options.store.set(key, snapshot.state[key])

        if (onLoad) onLoad(this)
    }

    public use(middleware: MiddlewareFn | MiddlewareFn[]) {
        if (Array.isArray(middleware)) {
            for (const middlw of middleware) this.middlewares.push(middlw)
        }
        else this.middlewares.push(middleware)
    }

    public dispatch(command: ICommand) {
        if (this.options.commandBusOptions?.usingCommangQueue) this.commandQueue.push(command) 
        else this.proccessCmd(command)
    }

    public start(fps=BASE_FPS) {
        if (this.isStarted) return false

        this.isStarted = true
        this.gameIntervalId = setInterval(() => {
            this._currentTick ++

            this.tick()
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
     * Internal game tick processes
     */
    public tick() {
        this.plugins.forEach((plugin) => {
            try {
                if (plugin.beforeTick) plugin.beforeTick(this)

                const proto = Object.getPrototypeOf(plugin)

                if (proto.__ticks) proto.__ticks.forEach((t: { methodName: string, interval: number, type: 'before' | 'after' }) => {
                    if (t.type === 'before' && (this._currentTick % t.interval === 0)) {
                        const method = extractMethodFromPlugin(plugin, t.methodName)

                        if (method) method.call(plugin, this)
                    }
                })
            } catch (e) {
                console.error(`[${plugin.name}] error:`, e)
            }
        })

        if (this.options.commandBusOptions?.usingCommangQueue) {
            let executed = 0;

            while (executed < (this.options.commandBusOptions?.maxCommandsPerTick ?? BASE_MAX_COMMAND_EXECUTING_ON_TICK_LIMIT)) {
                const cmd = this.commandQueue.shift()

                if (cmd) this.proccessCmd(cmd)
                else break

                executed ++
            }
        }

        this.plugins.forEach((plugin) => {
            try {
                if (plugin.afterTick) plugin.afterTick(this)

                const proto = Object.getPrototypeOf(plugin)

                if (proto.__ticks) proto.__ticks.forEach((t: { methodName: string, interval: number, type: 'before' | 'after' }) => {
                    if (t.type === 'after' && (this._currentTick % t.interval === 0)) {
                        const method = extractMethodFromPlugin(plugin, t.methodName)

                        if (method) method.call(plugin, this)
                    }
                })
            } catch (e) {
                console.error(`[${plugin.name}] error:`, e)
            }
        })
    }

    /**
     * Returns a current game tick
     */
    public get currentTick() {
        return this._currentTick
    }
}
