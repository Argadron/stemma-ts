import type { GameMap } from "@world";
import { GameObjectEnum } from "@enums";
import type { IGameObject } from "@interfaces";
import type { EntityManager } from "@";
import type { Position } from "@types";
import { createId, createQuadFromPosition, useAttack } from "@utils";

export class GameObject implements IGameObject {
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

    public shoot() {
        if (this.type === GameObjectEnum.TOWER) {
            const entites = this.map.getInQuad(createQuadFromPosition(this.position), 'ENTITES')

            let counter = 0;

            for (const victim of entites) {
                const { isDead } = useAttack(this.map.game, this.metadata.damage, this, victim)

                if (isDead) counter++
            }

            return {
                deathsCounter: counter
            }
        }
        else return false
    }
}