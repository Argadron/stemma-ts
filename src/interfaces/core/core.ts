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
}

export interface IGameMap {
    readonly manager: IEntityManager;
    readonly game: Game;
    readonly getInQuad: (quad: Quad) => Entity[];
    readonly teleport: (id: number, to: AnyPosition) => Entity | false;
    readonly getAllInPosition: (position: Position) => (Entity | Object)[];
    readonly createObject: <T = any>(obj: IGameObject, metadata?: T) => Object;
    readonly deleteObject: (id: number) => boolean;
    readonly getObject: (id: number) => Object | undefined;
    readonly getAllItems: () => (Object & IGameObject & IWorldItem)[];
}