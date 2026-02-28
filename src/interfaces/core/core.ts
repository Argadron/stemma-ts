import type { Game, UndoManager } from "@";
import type { CommandType, GameEvent } from "@enums";
import type { EventCallback, CustomEventCallback, Quad, AnyPosition, Position, SnapshotCallback, MiddlewareFn } from "@types";
import type { Entity, GameObject } from "@world";
import type { ITarget, IGameObject, IWorldItem, IEventInfo, IGameEffect } from "@interfaces";
import type { GlobalStore } from "@store";

export interface IGame {
    /**
     * Init game options
     */
    readonly options: IGameOptions;

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
    readonly load: (snapshot: ISnapshot, onLoad?: (game: Game) => void) => void;

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

export interface IGameOptions {
    /**
     * Entites in game
     */
    readonly entites: {
        readonly targets: Entity[];
        readonly manager: IEntityManager;
    }

    /**
     * Game Map
     */
    readonly map: IGameMap;

    /**
     * Global game state store
     */
    readonly store: GlobalStore;

    /**
     * Snapshots manager
     */
    readonly undoManager: UndoManager;

    /**
     * If true, baseChecksMiddleware will not be injected automatic
     */
    readonly disableBaseMiddleware?: boolean;

    /**
     * Flag to activate all built-in entities middlewares
     */
    readonly usingEntityMiddlewares?: boolean;

    /**
     * Flag to activate built-in object middlewares
     */
    readonly usingObjectMiddlewares?: boolean;
}

export interface IInitGameOptions extends Partial<IGameOptions> {}

export interface IEntityManager {
    /**
     * Game reference
     */
    readonly game: IGame;

    /**
     * Game map reference
     */
    readonly gameMap: IGameMap;

    /**
     * Create Entity in world
     * @param target - Entity data
     * @returns { Entity } - Created entity. Entity can be not created, then executed entityCreatedCollision event
     */
    readonly create: (target: ITarget) => Entity;

    /**
     * Get one Entity by id.
     * @param id - ID of Entity
     * @returns { Entity | undefined } - Entity if founded, else undefined
     */
    readonly get: (id: number) => Entity | undefined;

    /**
     * Update one Entity by id
     * @param id - ID of entity
     * @param target - Updating plants
     * @returns { Entity | undefined } - Updated Entity, undefined if not founded
     */
    readonly update: (id: number, target: Partial<ITarget>) => Entity | undefined;

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
     * @param entites - Entities to load
     * @returns { void }
     */
    readonly load: (rawEntity: ITarget[]) => void;
}

export interface IGameMap {
    /**
     * Entity Manager reference
     */
    readonly manager: IEntityManager;

    /**
     * Game reference
     */
    readonly game: Game;

    readonly objects: GameObject[];

    /**
     * Get world objects in quad
     * @param quad - Quad to search
     * @param returnType - Type of return values
     */
    getInQuad(quad: Quad, returnType?: 'ALL'): (Entity | GameObject)[];
    getInQuad(quad: Quad, returnType: 'ENTITES'): Entity[];
    getInQuad(quad: Quad, returnType: 'OBJECTS'): GameObject[];
    getInQuad(quad: Quad, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity[] | GameObject[] | (Entity | GameObject)[];

    /**
     * Teleport one Entity to new position
     * @param id - ID of Entity
     * @param to - AnyPosition for TP
     * @returns { Entity | false } - Entity if teleported, else false
     */
    readonly teleport: (id: number, to: AnyPosition) => Entity | false;

    /**
     * Get all world objects in provided position
     * @param position - Position to get objects
     * @returns { (Entity | GameObject)[] } - Array of world objects
     */
    getAllInPosition(position: Position, returnType?: 'ALL'): (Entity | GameObject)[];
    getAllInPosition(position: Position, returnType: 'ENTITES'): Entity[];
    getAllInPosition(position: Position, returnType: 'OBJECTS'): GameObject[];
    getAllInPosition(position: Position, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity[] | GameObject[] | (Entity | GameObject)[];
    getAllInPosition(position: Position, returnType:'ALL' | 'ENTITES' | 'OBJECTS'): (Entity | GameObject)[];

    /**
     * Create game object
     * @param obj - Object info
     * @param metadata - Object metadata
     * @returns { GameObject } - GameObject, also generates object error events, if need
     */
    readonly createObject: <T = any>(obj: IGameObject, metadata?: T) => GameObject;
    
    /**
     * Delete one object by id
     * @param id - ID of GameObject
     * @returns { boolean } - True if object deleted, else false
     */
    readonly deleteObject: (id: number) => boolean;

    /**
     * Get one object by id
     * @param id - ID of object
     * @returns { GameObject | undefined } - GameObject if founded, else false
     */
    readonly getObject: (id: number) => GameObject | undefined;

    /**
     * Get all Items on map
     * @returns { (GameObject & IGameObject & IWorldItem)[] } - Array of Items
     */
    readonly getAllItems: () => (GameObject & IGameObject & IWorldItem)[];

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
    readonly load: (rawObjects: IGameObject[]) => void;

    /**
     * Apply effect to provided Quad area
     * @param quad - Quad to apply effect
     * @param effect - Effect to apply
     * @param duration - Effect duration
     * @param excludeId - Optional ID of entity, effect will not be applied to her
     * @returns { Entity[] } - Array of entites founded in quad on applying effect
     */
    readonly applyEffectToQuad: (quad: Quad, effect: IGameEffect, duration: number, excludeId?: number) => Entity[];
}

export interface ISnapshot {
    /**
     * Array of game objects
     */
    readonly objects: IGameObject[];

    /**
     * Array of entities
     */
    readonly entities: ITarget[];

    /**
     * Global state 
     */
    readonly state: Record<string, any>;
}

export interface ICommand<T = any> {
    /**
     * Tick, when cmd executed
     */
    readonly tick: number;

    /**
     * Command type
     */
    readonly type: CommandType;

    /**
     * Entity ID, who start cmd
     */
    readonly entityId?: number;

    /**
     * Object id, who start cmd
     */
    readonly objectId?: number;

    /**
     * Cmd data
     */
    readonly data: T
}