import type { UndoManager } from "@";
import type { IEntityManager, IGameMap } from "@interfaces";
import type { GlobalStore } from "@store";
import type { Entity } from "@world";

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

    /**
     * Optional command bus options
     */
    readonly commandBusOptions?: ICommandBusOptions;
}

export interface ICommandBusOptions {
    /**
     * Flag indicates, will be used CommandQueue for all commands or not
     */
    readonly usingCommangQueue?: boolean;

    /**
     * Max commands will be executed in current tick
     */
    readonly maxCommandsPerTick?: number;
}

export interface IInitGameOptions extends Partial<IGameOptions> {}