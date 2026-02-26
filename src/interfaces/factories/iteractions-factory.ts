import type { Game } from "@";
import type { IBaseFactoriesOptions } from "@interfaces";
import type { Entity, GameObject } from "@world";

export interface IIteractionsFactory {
    /**
     * Create a new iteraction
     * @param iteraction - Iteraction data
     * @returns { IGameIteraction } - Created iteraction
     */
    readonly create: (iteraction: IIteraction) => IGameIteraction;

    /**
     * Get iteraction by id
     * @param id - ID of iteraction
     * @returns { IGameIteraction | undefined } - IGameIteraction if founded, else undefined
     */
    readonly get: (id: number) => IGameIteraction | undefined;
}

export interface IIteractionsFactoryOptions extends IBaseFactoriesOptions {}

export interface IIteraction {
    /**
     * Method to check, can entity iteract with this object
     * @param e - Entity to check
     * @param o - Object to check
     * @returns { boolean } - True if can, else false
     */
    readonly can?: (e: Entity, o: GameObject) => boolean;

    /**
     * What will do in iteract
     * @param e - Entity, who activate iteract
     * @param o - Object to iteract
     * @param game - Game reference
     * @returns { void }
     */
    readonly use: (e: Entity, o: GameObject, game: Game) => void
}

export interface IGameIteraction extends IIteraction {
    readonly id: number;
}