import type { Game } from "@";
import type { GameEvent } from "@enums";
import type { EventCallback, CustomEventCallback, Quad, AnyPosition, Position } from "@types";
import type { Entity, Object } from "@world";
import type { ITarget, IGameObject, IWorldItem, IEventInfo } from "@interfaces";

export interface IGame {
    readonly options: IGameOptions;
    readonly on: <T>(event: keyof typeof GameEvent, cb: EventCallback<T>) => void; 
    readonly processEvent: <T>(event: keyof typeof GameEvent, info: IEventInfo<T>) => void;
    readonly processCustomEvent: <T>(event: string, info: IEventInfo<T>) => void;
    readonly registerCustomEvent: <T>(event: string, cb: CustomEventCallback<T>) => void;
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
    readonly update: (id: number, target: Entity) => Entity | undefined;
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
    getInQuad(quad: Quad, returnType?: 'ALL'): (Entity | Object)[];
    getInQuad(quad: Quad, returnType: 'ENTITES'): Entity[];
    getInQuad(quad: Quad, returnType: 'OBJECTS'): Object[];
    getInQuad(quad: Quad, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity[] | Object[] | (Entity | Object)[];
    readonly teleport: (id: number, to: AnyPosition) => Entity | false;
    readonly getAllInPosition: (position: Position) => (Entity | Object)[];
    readonly createObject: <T = any>(obj: IGameObject, metadata?: T) => Object;
    readonly deleteObject: (id: number) => boolean;
    readonly getObject: (id: number) => Object | undefined;
    readonly getAllItems: () => (Object & IGameObject & IWorldItem)[];

    /**
     * Checks a given object by ID is ok: exists, no collisions in position, exists in position
     * @param id - ID to check object
     * @returns { boolean } - True, if all OK
     */
    readonly checkObjectOk: (id: number) => boolean;
}