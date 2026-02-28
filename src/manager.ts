import { Game } from "@";
import type { 
    ITarget,
    IEntityCreatedCollisionData,
    IEntityManager as Manager,
    IDeadData
 } from "@interfaces";
import { Entity, GameMap } from "@world";
import { checkCollisions, getInPosition } from "@utils";
import { FactoryKeys } from "@enums";

export class EntityManager implements Manager {
    /**
     * Array of all entities
     */
    public entites: Entity[];
    public readonly game: Game;
    public readonly gameMap: GameMap;

    public load(rawEntity: ITarget[]) {
        this.entites = rawEntity.map((raw) => Entity.fromSnapshot(raw, this, this.gameMap, this.game.getFactory(FactoryKeys.EFFECTS)))
    }

    public constructor(entites: ITarget[], game: Game) {
        this.entites = entites as Entity[]
        this.gameMap = new GameMap(this, game)
        this.game = game
    }

    public get(id: number) {
        return this.entites.find((entity) => entity.id === id)
    }

    public create(target: ITarget) {
        const entity = new Entity(target, this, this.gameMap)

        this.entites.push(entity)

        return entity
    }

    public update(id: number, target: Partial<ITarget>) {
        const entity = this.get(id)

        if (!entity) return undefined
        else {
            entity.damage = target.damage ?? entity.damage
            entity.health = target.health ?? entity.health
            entity.isDead = target.isDead ?? entity.isDead
            entity.position = target.position ?? entity.position
            entity.name = target.name ?? entity.name

            return entity
        }
    }

    public delete(id: number) {
        const currentLength = this.entites.length

        this.entites = this.entites.filter((entity) => !(entity.id === id))

        if (currentLength === this.entites.length) return false
        else return true
    }

    public kill(id: number) {
        const entity = this.get(id)

        if (!entity) return false
        else {
            entity.isDead = true
            entity.dropInventory()

            this.game.processEvent<IDeadData>('entityDead', {
                entity,
                eventTime: this.game.currentTick,
                eventData: {
                    entity,
                    killer: this
                }
            })

            return true
        }
    }
    
    public checkEntityOk(id: number): boolean {
        const entity = this.get(id)
        
        if (!entity) return false
        if (!getInPosition(entity.position, this.entites)) return false

        return !checkCollisions(this.gameMap.getAllInPosition(entity.position), entity)
    }
}