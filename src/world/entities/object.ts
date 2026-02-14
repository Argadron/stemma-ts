import type { GameMap } from "@world";
import type { GameObjectEnum } from "@enums";
import type { IGameObject } from "@interfaces";
import type { EntityManager } from "@";
import type { Position } from "@types";
import { createId } from "@utils";

export class Object implements IGameObject {
    readonly id = createId();

    type: GameObjectEnum;
    position: Position;
    name: string;
    metadata?: any;

    private readonly map: GameMap;
    private readonly manager: EntityManager;
    
    public constructor(obj: IGameObject, manager: EntityManager, map: GameMap, metadata?: any) {
       this.name = obj.name
       this.position = obj.position
       this.type = obj.type
       this.manager = manager
       this.map = map
       this.metadata = metadata
    }
}