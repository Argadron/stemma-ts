import type { 
    IBluePrint, 
    IBluePrintsFactory, 
    IBluePrintsFactoryOptions
} from "@interfaces";
import type { BlueprintContent, Position } from "@types";
import { blueprintIsTarget, createId } from "@utils";
import { Entity, type GameObject } from "@world";

export class BluePrintsFactory implements IBluePrintsFactory {
    private readonly options: IBluePrintsFactoryOptions;
    private readonly blueprints = new Map<number, IBluePrint>();

    public constructor(options: IBluePrintsFactoryOptions) {
        this.options = options
    }

    public register(blueprint: BlueprintContent): IBluePrint {
        const createdBlueprint = {
            id: createId(),
            blueprint
        }

        this.blueprints.set(createdBlueprint.id, createdBlueprint)

        return createdBlueprint
    }

    public get(id: number) {
        return this.blueprints.get(id)
    }

    public create(blueprint: IBluePrint, position: Position): (Entity | GameObject)
    public create(blueprint: IBluePrint[], position: Position[]): (Entity | GameObject)[]
    public create(blueprint: IBluePrint | IBluePrint[], position: Position[] | Position)  {
        const { manager, map } = this.options.game.options

        function spawn(b: IBluePrint, position: Position) {
            const data = {
                ...b.blueprint,
                position
            }

            return blueprintIsTarget(data) ? manager.create(data) : map.createObject(data)
        }

        if (Array.isArray(blueprint) && Array.isArray(position)) return blueprint.map((bl, index) => position[index] ? spawn(bl, position[index] as Position) : false).filter(Boolean)
        else if (!(Array.isArray(blueprint)) && !(Array.isArray(position))) return spawn(blueprint, position)

        return []
    }
}