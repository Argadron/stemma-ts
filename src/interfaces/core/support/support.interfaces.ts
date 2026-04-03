import type { Game } from "@";
import type { CommandType } from "@enums";
import type { IGameObject, ITarget } from "@interfaces";
import type { CommandContext, LifecycleCallback } from "@types";

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
    readonly state: CommandContext;
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
    readonly entityId?: number | undefined;

    /**
     * Object id, who start cmd
     */
    readonly objectId?: number | undefined;

    /**
     * If command indicated as system, then all middlewares will be skipped
     */
    readonly isSystem?: boolean;

    /**
     * Cmd data
     */
    readonly data: T
}

export interface IPlugin {
    /**
     * Name of this plugin
     */
    readonly name: string;

    /**
     * Plugin installation. Must return true, if install did success
     * @param game - Game reference
     * @returns { boolean } - True, if success, else false
     */
    readonly install: (game: Game) => boolean;

    /**
     * Executes before next tick
     * @param game - Game reference
     * @returns { void }
     */
    readonly beforeTick?: (game: Game) => void;

    /**
     * Executes after current tick
     * @param game - Game reference
     * @returns { void }
     */
    readonly afterTick?: (game: Game) => void; 

    /**
     * Lifecycle hook, executes before game launched. Must be sync
     * @param game - Game reference
     * @returns { void }
     */
    readonly beforeGameLaunch?: (game: Game) => void;

    /**
     * Lifecycle hook, executes after game launched. Must be sync
     * @param game 
     * @returns 
     */
    readonly afterGameLaunch?: (game: Game) => void;

    /**
     * Lifecycle hook, executes before command go to middlewares
     * @param game - Game reference
     * @param cmd - Executing cmd
     * @param ctx - Cmd context
     * @returns { void }
     */
    readonly beforeCommandExecuted?: LifecycleCallback;

    /**
     * Lifecycle hook, executes after command executed in kernel
     * @param game - Game reference
     * @param cmd - Executed cmd
     * @param ctx - Cmd context
     * @returns { void }
     */
    readonly afterCommandExecuted?: LifecycleCallback;
}