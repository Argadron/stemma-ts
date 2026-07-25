import type { Game } from "@core";
import type { GameEvent } from "@enums";
import type { 
    IEventInfo, 
    IGameOptions, 
    IPlugin, 
    ISnapshot, 
    ICommand, 
    IGameEffect,
    ITarget,
    IGameObject,
    IWorldItem
} from "@interfaces";
import type { 
    AnyPosition,
    CustomEventCallback, 
    EventCallback, 
    GeometryToPosition, 
    GeometryTypes, 
    MiddlewareFn, 
    Position, 
    Position3D, 
    Quad, 
    SnapshotCallback
} from "@types";
import type { Entity, GameObject } from "@world";

export interface IGame<G extends GeometryTypes = '2D'> {
    /**
     * Init game options
     */
    readonly options: IGameOptions<G>;

    /**
     * Subscribe to game event
     * @param event - GameEvent
     * @param cb - Callback will executed on event
     * @returns { VoidFunction } - Function to unsubscribe
     */
    readonly on: <T>(event: keyof typeof GameEvent, cb: EventCallback<T>) => VoidFunction; 

    /**
     * Call event for all subs
     * @param event - Event name
     * @param info - Current event data
     * @returns { void }
     */
    readonly processEvent: <T>(event: keyof typeof GameEvent, info: IEventInfo<T>) => void;

    /**
     * Call custom event for all subs
     * @param event - Event name
     * @param info - Current event data
     * @returns { void }
     */
    readonly processCustomEvent: <T>(event: string, info: IEventInfo<T>) => void;

    /**
     * Subscribe to custom event
     * @param event - Custom event
     * @param cb - Callback will executed on event
     * @returns { VoidFunction } - Function to unsubscribe
     */
    readonly registerCustomEvent: <T>(event: string, cb: CustomEventCallback<T>) => VoidFunction;

    /**
     * Connect any factory instance into game
     * @param name - Factory key. Use factory keys enum to auto snapshots
     * @param factory - Factory instance
     * @returns { T }
     */
    readonly connectFactory: <T>(name: string, factory: T) => T;

    /**
     * Get factory by name
     * @param name - Factory name
     * @returns { T }
     */
    readonly getFactory: <T>(name: string) => T;

    /**
     * Register a new plugin
     * @param plugin - Plugin to install
     * @returns { boolean } - True if success install, else false
     */
    readonly registerPlugin: (plugin: IPlugin | IPlugin[]) => boolean; 

    /**
     * Get plugin by name
     * @param name - Name of plugin
     * @returns { IPlugin | undefined } - Plugin if founded, else undefined
     */
    readonly getPlugin: (name: string) => IPlugin | undefined;

    /**
     * Get all plugins in game
     * @returns { IPlugin[] } - Array of plugins
     */
    readonly getAllPlugins: () => IPlugin[];

    /**
     * Save a game snapshot
     * @returns { ISnapshot }
     */
    readonly save: (cb?: SnapshotCallback) => ISnapshot;

    /**
     * Load a snapshot. ALL objects and entities will be rewrited
     * @param snapshot - Game snapshot
     * @param onLoad - Function will be executed after load snapshot
     * @returns { boolean } - True if correct load, else false
     */
    readonly load: (snapshot: ISnapshot<GeometryToPosition<G>>, onLoad?: (game: Game) => void) => void;

    /**
     * Register a middleware
     * @param middleware - Middleware function
     * @returns { void }
     */
    readonly use: (middleware: MiddlewareFn | MiddlewareFn[]) => void;

    /**
     * Command dispatcher method
     * @param command - Command to executing
     * @returns { void }
     */
    readonly dispatch: (command: ICommand) => void;

    /**
     * Start the game
     * @param fps - FPS
     * @returns { boolean } - True if success start, else false
     */
    readonly start: (fps: number) => boolean;

    /**
     * Stop the game
     * @returns { boolean } - True if success stop, else false
     */
    readonly stop: () => boolean;
}

export interface IEntityManager<G extends GeometryTypes, T extends Position | Position3D = GeometryToPosition<G>> {
    /**
     * Game reference
     */
    readonly game: IGame<G>;

    /**
     * Game map reference
     */
    readonly gameMap: IGameMap<G, T>;

    /**
     * Map of all game entities
     */
    readonly entities: Map<number, Entity<G, T>>;

    /**
     * Create Entity in world
     * @param target - Entity data
     * @returns { Entity } - Created entity. Entity can be not created, then executed entityCreatedCollision event
     */
    readonly create: (target: ITarget<T>) => Entity<G, T>;

    /**
     * Get one Entity by id.
     * @param id - ID of Entity
     * @returns { Entity | undefined } - Entity if founded, else undefined
     */
    readonly get: (id: number) => Entity<G, T> | undefined;

    /**
     * Update one Entity by id
     * @param id - ID of entity
     * @param target - Updating plants
     * @returns { Entity | undefined } - Updated Entity, undefined if not founded
     */
    readonly update: (id: number, target: Partial<ITarget<T>>) => Entity<G, T> | undefined;

    /**
     * Delete one Entity by id
     * @param id - ID of entity
     * @returns { boolean } - True if entity deleted, false if not founded
     */
    readonly delete: (id: number) => boolean; 

    /**
     * Kill one Entity by id
     * @param id - ID of entity
     * @returns { boolean } - True if Entity killed, else false
     */
    readonly kill: (id: number) => boolean;

    /**
     * Checks a given entity by ID is ok: exists, no collisions in position, exists in position
     * @param id - ID to check entity
     * @returns { boolean } - True, if all OK
     */
    readonly checkEntityOk: (id: number) => boolean;

    /**
     * Internal method for reload map (delete all entities and load)
     * @param entities - Entities to load
     * @returns { void }
     */
    readonly load: (rawEntity: ITarget<T>[]) => void;
}

export interface IGameMap<G extends GeometryTypes, T extends Position | Position3D = GeometryToPosition<G>> {
    /**
     * Entity Manager reference
     */
    readonly manager: IEntityManager<G, T>;

    /**
     * Game reference
     */
    readonly game: Game<G>;

    /**
     * Map of all game objects
     */
    readonly objects: Map<number, GameObject<T>>;

    /**
     * Get world objects in quad
     * @param quad - Quad to search
     * @param returnType - Type of return values
     */
    getInQuad(quad: Quad, returnType?: 'ALL'): (Entity<G, T> | GameObject<T>)[];
    getInQuad(quad: Quad, returnType: 'ENTITES'): Entity<G, T>[];
    getInQuad(quad: Quad, returnType: 'OBJECTS'): GameObject<T>[];
    getInQuad(quad: Quad, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity<G, T>[] | GameObject<T>[] | (Entity<G, T> | GameObject<T>)[];

    /**
     * Teleport one Entity to new position
     * @param id - ID of Entity
     * @param to - AnyPosition for TP
     * @returns { Entity | false } - Entity if teleported, else false
     */
    readonly teleport: (id: number, to: AnyPosition) => Entity<G, T> | false;

    /**
     * Get all world objects in provided position
     * @param position - Position to get objects
     * @returns { (Entity | GameObject)[] } - Array of world objects
     */
    getAllInPosition(position: Position | Position3D, returnType?: 'ALL'): (Entity<G, T> | GameObject<T>)[];
    getAllInPosition(position: Position | Position3D, returnType: 'ENTITES'): Entity<G, T>[];
    getAllInPosition(position: Position | Position3D, returnType: 'OBJECTS'): GameObject<T>[];
    getAllInPosition(position: Position | Position3D, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity<G, T>[] | GameObject<T>[] | (Entity<G, T> | GameObject<T>)[];
    getAllInPosition(position: Position | Position3D, returnType:'ALL' | 'ENTITES' | 'OBJECTS'): (Entity<G, T> | GameObject<T>)[];

    /**
     * Create game object
     * @param obj - Object info
     * @param metadata - Object metadata
     * @returns { GameObject } - GameObject, also generates object error events, if need
     */
    readonly createObject: <M = any>(obj: IGameObject<M, T>, metadata?: M) => GameObject<T>;
    
    /**
     * Delete one object by id
     * @param id - ID of GameObject
     * @returns { boolean } - True if object deleted, else false
     */
    readonly deleteObject: (id: number) => boolean;

    /**
     * Get one object by id
     * @param id - ID of object
     * @returns { GameObject | undefined } - GameObject if founded, else undefined
     */
    readonly getObject: (id: number) => GameObject<T> | undefined;

    /**
     * Get all Items on map
     * @returns { (GameObject & IGameObject & IWorldItem)[] } - Array of Items
     */
    readonly getAllItems: () => (GameObject<T, G> & IGameObject<any, T> & IWorldItem<T>)[];

    /**
     * Checks a given object by ID is ok: exists, no collisions in position, exists in position
     * @param id - ID to check object
     * @returns { boolean } - True, if all OK
     */
    readonly checkObjectOk: (id: number) => boolean;

    /**
     * Internal method for reload map (delete all objects and load)
     * @param objects - Objects to load
     * @returns { void }
     */
    readonly load: (rawObjects: IGameObject<any, T>[]) => void;

    /**
     * Apply effect to provided Quad area
     * @param quad - Quad to apply effect
     * @param effect - Effect to apply
     * @param duration - Effect duration
     * @param excludeId - Optional ID of entity, effect will not be applied to her
     * @returns { Entity<T>[] } - Array of entities founded in quad on applying effect
     */
    readonly applyEffectToQuad: (quad: Quad, effect: IGameEffect, duration: number, excludeId?: number) => Entity<G, T>[];
}

export interface IDeligator {
    readonly deligate: (cmd: ICommand) => void;
}