import type { Game } from "@";
import type { GameEvent } from "@enums";
import type { EventCallback, CustomEventCallback, Quad, AnyPosition, Position } from "@types";
import type { Entity, GameObject } from "@world";
import type { ITarget, IGameObject, IWorldItem, IEventInfo } from "@interfaces";

export interface IGame {
    readonly options: IGameOptions;

    /**
     * Subscribe to game event
     * @param event - GameEvent
     * @param cb - Callback will executed on event
     * @returns { VoidFunction } - Function to unsubscribe
     */
    readonly on: <T>(event: keyof typeof GameEvent, cb: EventCallback<T>) => VoidFunction; 
    readonly processEvent: <T>(event: keyof typeof GameEvent, info: IEventInfo<T>) => void;
    readonly processCustomEvent: <T>(event: string, info: IEventInfo<T>) => void;

    /**
     * Subscribe to custom event
     * @param event - Custom event
     * @param cb - Callback will executed on event
     * @returns { VoidFunction } - Function to unsubscribe
     */
    readonly registerCustomEvent: <T>(event: string, cb: CustomEventCallback<T>) => VoidFunction;
    readonly start: (fps: number) => void;
}

export interface IGameOptions {
    readonly entites: {
        readonly targets: Entity[];
        readonly manager: IEntityManager;
    }
    readonly map: IGameMap;
}

export interface IEntityManager {
    readonly game: IGame;
    readonly gameMap: IGameMap;
    readonly create: (target: ITarget) => Entity;
    readonly get: (id: number) => Entity | undefined;
    readonly update: (id: number, target: Partial<ITarget>) => Entity | undefined;
    readonly delete: (id: number) => boolean; 
    readonly kill: (id: number) => boolean;

    /**
     * Checks a given entity by ID is ok: exists, no collisions in position, exists in position
     * @param id - ID to check entity
     * @returns { boolean } - True, if all OK
     */
    readonly checkEntityOk: (id: number) => boolean;
}

export interface IGameMap {
    readonly manager: IEntityManager;
    readonly game: Game;
    getInQuad(quad: Quad, returnType?: 'ALL'): (Entity | GameObject)[];
    getInQuad(quad: Quad, returnType: 'ENTITES'): Entity[];
    getInQuad(quad: Quad, returnType: 'OBJECTS'): GameObject[];
    getInQuad(quad: Quad, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity[] | GameObject[] | (Entity | GameObject)[];
    readonly teleport: (id: number, to: AnyPosition) => Entity | false;
    readonly getAllInPosition: (position: Position) => (Entity | GameObject)[];
    readonly createObject: <T = any>(obj: IGameObject, metadata?: T) => GameObject;
    readonly deleteObject: (id: number) => boolean;
    readonly getObject: (id: number) => GameObject | undefined;
    readonly getAllItems: () => (GameObject & IGameObject & IWorldItem)[];

    /**
     * Checks a given object by ID is ok: exists, no collisions in position, exists in position
     * @param id - ID to check object
     * @returns { boolean } - True, if all OK
     */
    readonly checkObjectOk: (id: number) => boolean;
}