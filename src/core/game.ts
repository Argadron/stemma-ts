import { CommandType, FactoryKeys, GameEvent } from "@enums";
import type { 
    IGame, 
    IGameOptions, 
    IEventInfo, 
    ISnapshot, 
    ICommand, 
    IInitGameOptions, 
    IPlugin, 
    IGlobalStateChangedData, 
    IObjectDeletedOrCreatedData, 
    IEntityTagsChangedData, 
    ICommandBlocked 
} from "@interfaces";
import { EntityManager, UndoManager } from "@core";
import type { 
    EventCallback, 
    CustomEventCallback, 
    SnapshotCallback, 
    MiddlewareFn, 
    OnEventDecoratorProperties, 
    OnTickDecoratorProperties, 
    OnCustomEventDecoratorProperties, 
    InjectStoreValueDecoratorProperties, 
    InjectLiveQueryDecoratorProperties, 
    InjectLiveQueryObjectDecoratorProperties, 
    BasePropertyDecorator, 
    WhenDecoratorProperties, 
    CommandContext, 
    OnTagsChangesDecoratorsProperties, 
    OnUIEventDecoratorProperties,
    OnConsoleKeyboardEventDecoratorProperites
} from "@types";
import { BASE_FPS, BASE_MAX_COMMAND_EXECUTING_ON_TICK_LIMIT, isServer } from "@const";
import { BluePrintsFactory, EffectFactory, IteractionsFactory, QuestsFactory, SoundsFactory } from "@factories";
import { GlobalStore } from "@store";
import { 
    baseChecksMiddleware, 
    DropItemGuard, 
    EntityInteractGuard, 
    EquipItemGuard, 
    MovementGuard, 
    OpenChestGuard, 
    PickUpGuard, 
    ShootGuard, 
    UseItemGuard 
} from "@middlewares";
import { 
    createPluginProto, 
    extractMethodFromPlugin, 
    extractPropertyFromPlugin, 
    useLink, 
    useValidation, 
    useVisibility, 
    useAttack, 
    useAsyncState, 
    useServer, 
    useState, 
    useWO,
    useQuestion,
    useAlternative,
    usePause
} from "@utils";
import type { Entity, GameObject } from "@world";
import { ConflictResolverPlugin } from "@plugins";

export class Game implements IGame {
    readonly options: IGameOptions;

    /**
     * Flag indicates game start status
     */
    private isStarted = false;

    /**
     * ID of game interval loop
     */
    private gameIntervalId: number | undefined | NodeJS.Timeout;

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
    private kernelExecute(command: ICommand, ctx: CommandContext): void {
            switch(command.type) {
                case CommandType.SET_STATE:
                    this.options.store.set(command.data.key, command.data.value)
                    break
                case CommandType.CREATE_ENTITY:
                    this.options.manager.create(command.data.target)
                    break
                case CommandType.CREATE_OBJECT:
                    this.options.map.createObject(command.data.object)
                    break
                case CommandType.DELETE_OBJECT:
                    if (!command.objectId) return;

                    this.options.map.deleteObject(command.objectId)

                    break
                
                default: 
                    const entity = this.options.manager.get(command.entityId!)

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
        this.plugins.forEach(plugin => plugin.beforeCommandExecuted ? plugin.beforeCommandExecuted(this, cmd, {}) : null)
        this.options.undoManager.push(this.save())

        const ctx = {}
        const triggerPlugin = (context: CommandContext) => this.plugins.forEach(plugin => plugin.afterCommandExecuted ? plugin.afterCommandExecuted(this, cmd, context) : null)

        if (!cmd.isSystem) {
            let index = 0;
            let isNextCalled = false;

            const next = () => {
                isNextCalled = true

                const middleware = this.middlewares[index++]

                if (middleware) {
                    isNextCalled = false

                    middleware(cmd, next, this, ctx)
                }
                else {
                    this.kernelExecute(cmd, ctx)

                    triggerPlugin(ctx)
                }
            }

            next()

            if (!isNextCalled && !cmd.isSystem) this.processEvent<ICommandBlocked>('commandCanceled', {
                eventTime: this.currentTick,
                eventData: { command: cmd }
            })
        }
        else {
            this.kernelExecute(cmd, ctx)

            triggerPlugin(ctx)
        }
    }

    private processPluginRegister(plugin: IPlugin) {
        const proto = createPluginProto(plugin)

        if (proto.events) proto.events.forEach((e: OnEventDecoratorProperties) => this.on(e.event, (options, event, data) => {
            const method = extractMethodFromPlugin(plugin, e.methodName)

            if (method) method.call(plugin, { options, event, data })
        })) 

        if (proto.customEvents) proto.customEvents.forEach((e: OnCustomEventDecoratorProperties) => this.registerCustomEvent(e.event, (options, event, data) => {
            const method = extractMethodFromPlugin(plugin, e.methodName)

            if (method) method.call(plugin, { options, event, data })
        }))

        if (proto.injectedValues) proto.injectedValues.forEach((v: InjectStoreValueDecoratorProperties) => {
            const property = extractPropertyFromPlugin(plugin, v.propertyName)

            if (property) {
                const anyPlugin = plugin as any

                anyPlugin[property] = this.options.store.get(v.key)

                this.on<IGlobalStateChangedData>('globalStateChanged', (o, e, d) => (d.eventData.key === v.key) ? anyPlugin[property] = d.eventData.newValue : null)
            }
        })

        if (proto.liveQueries) proto.liveQueries.forEach((v: InjectLiveQueryDecoratorProperties) => {
            const anyPlugin = (plugin as any)

            let propertySet: Set<Entity>

            if ((anyPlugin[v.propertyName] instanceof Set)) propertySet = anyPlugin[v.propertyName]
            else propertySet = new Set<Entity>()

            Object.defineProperty(anyPlugin, v.propertyName, {
                get: function () { return propertySet },
                set: function() {},
                enumerable: true,
                configurable: false
            })

            function entityManupalite(event: "entity_created" | "entity_deleted" | 'scanner', entity?: Entity) {
                const eventEntity = entity!
                const baseEventsCondition = (event === 'entity_created' || event === 'scanner')
                
                const result = v.where ? v.where(eventEntity, event) : true

                if ((v.where && !result) || !baseEventsCondition) {
                    propertySet.delete(eventEntity)

                    return
                }
                if (
                    (!eventEntity.isDead || v.includeDeaths) && 
                    eventEntity.hasTag(v.all) && 
                    (v.none ? !(eventEntity.hasTag(v.none)) : true)
                ) {
                    baseEventsCondition ? propertySet.add(eventEntity) : null
                }
                else propertySet.delete(eventEntity)
            }

            this.options.manager.entities.forEach((e) => entityManupalite('scanner', e))

            this.on('entityCreated', (o, e, d) => entityManupalite('entity_created', d.entity as Entity))
            this.on('entityDeleted', (o, e, d) => entityManupalite('entity_deleted', d.entity as Entity))
            this.on('entityTagsChanged', (o, e, d) => entityManupalite('scanner', d.entity as Entity))
        })

        if (proto.liveQueriesObjects) proto.liveQueriesObjects.forEach((v: InjectLiveQueryObjectDecoratorProperties) => {
            const anyPlugin = (plugin as any)

            let propertySet: Set<GameObject>

            if ((anyPlugin[v.propertyName] instanceof Set)) propertySet = anyPlugin[v.propertyName]
            else propertySet = new Set<GameObject>()

            Object.defineProperty(anyPlugin, v.propertyName, {
                get: function () { return propertySet },
                set: function() {},
                enumerable: true,
                configurable: false
            })

            function objectManipulate(event: "object_created" | "object_deleted" | 'scanner', object?: GameObject) {
                const eventObject = object!
                const baseEventsCondition = (event === 'object_created' || event === 'scanner')

                if (!(v.where ? v.where(eventObject, event) : true) || !baseEventsCondition) {
                    propertySet.delete(eventObject)

                    return
                }
                else propertySet.add(eventObject)
            }

            this.options.map.objects.forEach((o) => objectManipulate('scanner', o))

            this.on<IObjectDeletedOrCreatedData>('objectCreated', (o, e, d) => objectManipulate('object_created', d.eventData.object))
            this.on<IObjectDeletedOrCreatedData>('objectDeleted', (o, e, d) => objectManipulate('object_deleted', d.eventData.object as GameObject))
        })

        if (proto.coreInjectings) proto.coreInjectings.forEach((v: BasePropertyDecorator) => {
            const anyPlugin = plugin as any

            anyPlugin[v.propertyName] = this
        })

        if (proto.tagAdds) proto.tagAdds.forEach((v: OnTagsChangesDecoratorsProperties) => this.on<IEntityTagsChangedData>("entityTagsChanged", (options, event, data) => {
                if (data.eventData.type === "ADD" && data.eventData.tag === v.tag) {
                    const method = extractMethodFromPlugin(plugin, v.methodName)

                    if (method) method.call(plugin, { options, event, data })
                }
            })
        )

        if (proto.tagRemovs) proto.tagRemovs.forEach((v: OnTagsChangesDecoratorsProperties) => this.on<IEntityTagsChangedData>("entityTagsChanged", (options, event, data) => {
                if (data.eventData.type === "DELETE" && data.eventData.tag === v.tag) {
                    const method = extractMethodFromPlugin(plugin, v.methodName)

                    if (method) method.call(plugin, { options, event, data })
                }
            })
        )

        if (proto.uiListeners) proto.uiListeners.forEach((v: OnUIEventDecoratorProperties) => {
            if (!isServer) {
                const method = extractMethodFromPlugin(plugin, v.methodName)

                if (method) {
                    const element = document.getElementById(v.id)

                    if (element) element.addEventListener(v.event, (e: Event) => method.call(plugin, e))
                }
            }
        })

        if (proto.consoleListeners && isServer) proto.consoleListeners.forEach((v: OnConsoleKeyboardEventDecoratorProperites) => {
            const method = extractMethodFromPlugin(plugin, v.methodName)

            if (method && process.stdin.isTTY) process.stdin.on("data", (key: string) => typeof v.key === 'string' ? v.key === key ? method.call(plugin, key) : null : v.key.test(key) ? method.call(plugin, key) : null)
        })

        const installResult = plugin.install(this)

        if (installResult) {
            this.plugins.set(plugin.name, plugin)

            return true
        }
        else return false
    }

    public constructor(
        options?: IInitGameOptions
    ) {
        const manager = new EntityManager([], this)

        this.options = {
            manager,
            map: manager.gameMap,
            store: new GlobalStore({ game: this }),
            undoManager: new UndoManager({ game: this }),
            ...options
        }
        this.connectFactory(FactoryKeys.EFFECTS, new EffectFactory({ game: this }))
        this.connectFactory(FactoryKeys.BLUEPRINTS, new BluePrintsFactory({ game: this }))
        this.connectFactory(FactoryKeys.QUESTS, new QuestsFactory({ game: this }))
        this.connectFactory(FactoryKeys.ITERACTIONS, new IteractionsFactory({ game: this }))
        this.connectFactory(FactoryKeys.SOUNDS, new SoundsFactory({ game: this }))

        if (!(options?.disableBaseMiddleware)) this.use(baseChecksMiddleware)
        if (options?.usingEntityMiddlewares) this.use([DropItemGuard, EntityInteractGuard, EquipItemGuard, MovementGuard, OpenChestGuard, PickUpGuard, UseItemGuard])
        if (options?.usingObjectMiddlewares) this.use([ShootGuard])
        if (!(options?.disableConflictResolver)) this.registerPlugin(new ConflictResolverPlugin())

        if (!(options?.disableHooksHydration)) {
            useLink.prototype.game = this
            useValidation.prototype.game = this
            useVisibility.prototype.game = this
            useAttack.prototype.game = this
            useAsyncState.prototype.game = this
            useServer.prototype.game = this
            useState.prototype.game = this
            useWO.prototype.game = this
            useQuestion.prototype.game = this
            usePause.prototype.game = this
            
            if (!useAlternative.prototype) useAlternative.prototype = { game: this }
            else useAlternative.prototype.game = this
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

    public registerPlugin(plugin: IPlugin | IPlugin[]): boolean {
        if (Array.isArray(plugin)) return plugin.map((p: IPlugin) => this.registerPlugin(p)).every((v) => v === true)
        else return this.processPluginRegister(plugin)
    }

    public getPlugin(name: string) {
        return this.plugins.get(name)
    }

    public getAllPlugins() {
        return Array.from(this.plugins.values())
    }

    public save(cb?: SnapshotCallback): ISnapshot {
        const snapshot = {
            entities: Array.from(this.options.manager.entities.values()).map((e) => e.toDTO()),
            objects: Array.from(this.options.map.objects.values()).map((o) => o.toDTO()),
            state: this.options.store.getAll()
        }
        
        if (cb) cb(snapshot)

        return snapshot
    }

    public load(snapshot: ISnapshot, onLoad?: (game: Game) => void) {
        this.options.map.load(snapshot.objects)
        this.options.manager.load(snapshot.entities)
        
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

        this.plugins.forEach(plugin => plugin.beforeGameLaunch ? plugin.beforeGameLaunch(this) : null)
        this.isStarted = true
        this.gameIntervalId = setInterval(() => {
            this._currentTick ++

            this.tick()
            this.options.manager.entities.forEach((entity) => entity.tick())
            this.options.map.objects.forEach((object) => object.tick())
        }, 1000/fps)
        this.processEvent<null>('gameStarted', {
            eventTime: this._currentTick,
            eventData: null
        })
        this.plugins.forEach(plugin => plugin.afterGameLaunch ? plugin.afterGameLaunch(this) : null)

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

                const proto = createPluginProto(plugin)

                if (proto.ticks) proto.ticks.forEach((t: OnTickDecoratorProperties) => {
                    if (t.type === 'before' && (this._currentTick % t.interval === 0)) {
                        const method = extractMethodFromPlugin(plugin, t.methodName)

                        if (method) method.call(plugin, this)
                    }
                })
                if (proto.whens) proto.whens.forEach((v: WhenDecoratorProperties) => {
                    if (v.when(this)) {
                        const method = extractMethodFromPlugin(plugin, v.methodName)

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

                const proto = createPluginProto(plugin)

                if (proto.ticks) proto.ticks.forEach((t: OnTickDecoratorProperties) => {
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

    /**
     * Returns a actually command queue length, undefined if queue not enabled
     * @returns { number } - Actual queue length
     */
    public get commandQueueLength(): number {
        return this.commandQueue.length;
    }

    /**
     * Load game as static method from snapshot
     * @param snapshot - Snapshot to load
     * @returns { Game } - Game from snapshot with live entities 
     */
    public static fromSnapshot(snapshot: ISnapshot, onLoad?: (game: Game) => void): Game {
        const engine = new Game()

        engine.load(snapshot, onLoad)

        return engine;
    }
}
