import type { Game } from "@";
import type { GameEvent } from "@enums";
import type { EventCallback, CustomEventCallback, Quad, AnyPosition, Position } from "@types";
import type { Entity, GameObject } from "@world";
import type { ITarget, IGameObject, IWorldItem, IEventInfo } from "@interfaces";

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
     * Start the game
     * @param fps - FPS
     * @returns { void }
     */
    readonly start: (fps: number) => void;
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
}

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
    readonly getAllInPosition: (position: Position) => (Entity | GameObject)[];

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
}