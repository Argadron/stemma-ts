import { Game } from "@";
import type { 
    ITarget,
    IEntityManager as Manager,
    IDeadData,
    IEntityCreatedData
 } from "@interfaces";
import type { GridPosition, Position } from "@types";
import { Entity, GameMap } from "@world";
import { checkCollisions, convertPositionToGridPosition, getInPosition } from "@utils";
import { FactoryKeys } from "@enums";

export class EntityManager implements Manager {
    /**
     * Array of all entities
     */
    public entites: Entity[];
    public readonly game: Game;
    public readonly gameMap: GameMap;
    public readonly grid = new Map<GridPosition, Set<Entity>>()

    public load(rawEntity: ITarget[]) {
        this.entites = rawEntity.map((raw) => Entity.fromSnapshot(raw, this, this.gameMap, this.game.getFactory(FactoryKeys.EFFECTS)))
    }

    /**
     * Add new entity to grid map
     * @param entity - Entity to add
     * @returns { void }
     */
    public addToGrid(entity: Entity): void {
        const gridPosition = convertPositionToGridPosition(entity.position)

        if (!this.grid.has(gridPosition)) this.grid.set(gridPosition, new Set([entity]))
        else this.grid.get(gridPosition)!.add(entity)
    }

    /**
     * Delete entity from grid map
     * @param entity - Entity to delete
     * @returns { void }
     */
    public deleteFromGrid(entity: Entity): void {
        const gridPosition = convertPositionToGridPosition(entity.position)
        const cell = this.grid.get(gridPosition)

        if (cell) {
            cell.delete(entity)

            if (cell.size === 0) this.grid.delete(gridPosition)
        }
    }

    /**
     * Update grid position
     * @param entity - Entity with new grid position
     * @param oldPosition - Entity old position
     * @returns { void }
     */
    public updateGrid(entity: Entity, oldPosition: Position): void {
        const oldGrid = convertPositionToGridPosition(oldPosition)
        const newGrid = convertPositionToGridPosition(entity.position)

        if (oldGrid === newGrid) return
        else {
            const cell = this.grid.get(oldGrid)

            if (cell) {
                cell.delete(entity)

                if (cell.size === 0) this.grid.delete(oldGrid)
            }

            this.addToGrid(entity)
        }
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

        this.addToGrid(entity)
        this.entites.push(entity)
        this.game.processEvent<IEntityCreatedData>('entityCreated', {
            entity,
            eventTime: this.game.currentTick,
            eventData: {
                fromTarget: target
            }
        })

        return entity
    }

    public update(id: number, target: Partial<ITarget>) {
        const entity = this.get(id)

        if (!entity) return undefined
        else {
            entity.damage = target.damage ?? entity.damage
            entity.health = target.health ?? entity.health
            entity.isDead = target.isDead ?? entity.isDead
            entity.name = target.name ?? entity.name

            if (target.position) {
                this.updateGrid(target as Entity, entity.position)

                entity.position = target.position
            }

            return entity
        }
    }

    public delete(id: number) {
        const entity = this.get(id)

        if (entity) {
            this.game.processEvent<{}>('entityDeleted', {
                entity,
                eventTime: this.game.currentTick,
                eventData: {}
            })
            this.deleteFromGrid(entity)
            this.entites = this.entites.filter((entity) => !(entity.id === id))

            return true
        }
        else return false
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