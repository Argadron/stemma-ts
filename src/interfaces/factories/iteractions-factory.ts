import type { Game } from "@core";
import type { IBaseFactoriesOptions } from "@interfaces";
import type { GeometryToPosition, GeometryTypes } from "@types";
import type { Entity, GameObject } from "@world";

export interface IIteractionsFactory<G extends GeometryTypes> {
    /**
     * Create a new iteraction
     * @param iteraction - Iteraction data
     * @returns { IGameIteraction } - Created iteraction
     */
    readonly create: (iteraction: IIteraction<G>) => IGameIteraction<G>;

    /**
     * Get iteraction by id
     * @param id - ID of iteraction
     * @returns { IGameIteraction | undefined } - IGameIteraction if founded, else undefined
     */
    readonly get: (id: number) => IGameIteraction<G> | undefined;
}

export interface IIteractionsFactoryOptions extends IBaseFactoriesOptions {}

export interface IIteraction<G extends GeometryTypes> {
    /**
     * Method to check, can entity iteract with this object
     * @param e - Entity to check
     * @param o - Object to check
     * @returns { boolean } - True if can, else false
     */
    readonly can?: (e: Entity<G, GeometryToPosition<G>>, o: GameObject<GeometryToPosition<G>, G>) => boolean;

    /**
     * What will do in iteract
     * @param e - Entity, who activate iteract
     * @param o - Object to iteract
     * @param game - Game reference
     * @returns { void }
     */
    readonly use: (e: Entity<G, GeometryToPosition<G>>, o: GameObject<GeometryToPosition<G>, G>, game: Game<G>) => void
}

export interface IGameIteraction<G extends GeometryTypes> extends IIteraction<G> {
    readonly id: number;
}