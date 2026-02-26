import type { ITarget, IGameObject, IBaseFactoriesOptions } from "@interfaces"
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

export interface IBluePrintsFactoryOptions extends IBaseFactoriesOptions {}

export interface IBluePrint {
    /**
     * ID of blueprint
     */
    readonly id: number;

    /**
     * Blueprint content
     */
    readonly blueprint: BlueprintContent;
}