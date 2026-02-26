import type { Game } from "@";
import type { ITarget, IGameObject } from "@interfaces"
import { GameObject, type Entity } from "@world";
import type { BlueprintContent, Position } from "@types"

export interface IBluePrintsFactory {
    /**
     * Register a blueprint
     * @param blueprint - Blueprint
     * @returns { IBluePrint }
     */
    readonly register: (blueprint: ITarget | IGameObject) => IBluePrint;

    /**
     * Returns blueprint by id
     * @param id - ID of blueprint
     * @returns { IBluePrint | undefined } Blueprint if founded, else undefined
     */
    readonly get: (id: number) => IBluePrint | undefined;

    /**
     * Return instance(s) created by blueprint
     * @param blueprint - Blueprint to create instance
     * @returns { Entity | GameObject } - Created instance
     */
    create(blueprint: IBluePrint, position: Position): Entity | GameObject
    create(blueprint: IBluePrint[], position: Position[]): (Entity | GameObject)[]
    create(blueprint: IBluePrint | IBluePrint[], position: Position[] | Position): (Entity | GameObject) | (Entity | GameObject)[];
}

export interface IBluePrintsFactoryOptions {
    readonly game: Game;
}

export interface IBluePrint {
    readonly id: number;
    readonly blueprint: BlueprintContent;
}