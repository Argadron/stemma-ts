import type { Game, UndoManager } from "@core";
import type { IEntityManager, IGameMap } from "@interfaces";
import type { GlobalStore } from "@store";
import type { GeometryToPosition, GeometryTypes } from "@types";

export interface IGameOptions<G extends GeometryTypes='2D'|'3D'> {
    /**
     * Entities in game
     */
    readonly manager: IEntityManager<G, GeometryToPosition<G>>;

    /**
     * Game Map
     */
    readonly map: IGameMap<G, GeometryToPosition<G>>;

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
     * Flag to disable built-in ConflictResolverPlugin
     */
    readonly disableConflictResolver?: boolean;

    /**
     * Disable inject game into hooks for them functionallity.
     * If true, you need inject game into hooks options manually,
     * but this can be multiply perfomance
     */
    readonly disableHooksHydration?: boolean;

    /**
     * Optional command bus options
     */
    readonly commandBusOptions?: ICommandBusOptions;

    /**
     * Type of game geometry. By default, 2D
     */
    readonly gameGeometry?: G;
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

export interface IInitGameOptions<G extends GeometryTypes> extends Partial<IGameOptions<G>> {}

export interface IDeligatorOptions {
    /**
     * Delegator, who will execute this command
     */
    readonly source: URL | Game;

    /**
     * Deligator will be executed auto, when this command in observe engine has been saved
     */
    readonly triggerOn: number;

    /**
     * Engine to observe commands
     */
    readonly observe: Game; 
}