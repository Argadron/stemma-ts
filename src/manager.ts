import { Game } from "@";
import type { 
    ITarget,
    IEntityCreatedCollisionData,
    IEntityManager as Manager
 } from "@interfaces";
import { Entity, GameMap } from "@world";

export class EntityManager implements Manager {
    public entites: Entity[];
    public readonly game: Game;
    public readonly gameMap: GameMap;

    public constructor(entites: ITarget[], game: Game) {
        this.entites = entites as Entity[]
        this.gameMap = new GameMap(this, game)
        this.game = game
    }

    public get(id: number) {
        return this.entites.find((entity) => entity.id === id)
    }

    public create(target: ITarget) {
        if (this.gameMap.checkCollisions(target as Entity, target.position)) {
            this.game.processEvent<IEntityCreatedCollisionData>('entityCreatedCollision', {
                eventTime: new Date(),
                eventData: {
                    target
                }
            })

            return target as Entity
        }

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

            return true
        }
    }
}