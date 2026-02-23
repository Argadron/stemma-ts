import type { Game } from "@"
import { createGame } from "@"
import { GameObjectEnum } from "@enums"
import type { 
    IEntityCreatedCollisionData, 
    IMovedCollisionData, 
    IObjectCreatedCollisionData,
    IEntityManager,
    IGameMap,
    IMovedData
} from "@interfaces"
import { checkTwoPositions, positionIsPosition } from "@utils"
import type { Position } from "@types"
import type { Entity, GameObject } from "@world"

describe('Collisions Tests', () => {
    let game!: Game
    let manager!: IEntityManager
    let map!: IGameMap

    let player!: Entity
    let zombie!: Entity
    let wall!: GameObject

    beforeEach(() => {
        const [g, m, mapInstance] = createGame()

        game = g
        manager = m
        map = mapInstance

        player = manager.create({
            name: PLAYER,
            health: 10,
            damage: 10,
            isDead: false,
            position: [1, 0]
        })

        zombie = manager.create({
            name: ZOMBIE,
            health: 10,
            damage: 10,
            isDead: false,
            position: [1, 1]
        })

        wall = map.createObject({
            name: WALL,
            position: [0, 1],
            type: GameObjectEnum.WALL
        })

        game.on<IMovedCollisionData>('entityMovedCollision', (o, e, d) => {
            const { collisionPosition  } = d.eventData

            if (checkTwoPositions(player.position, collisionPosition as Position)) collisionMoveToEntityTest = true
            if (checkTwoPositions(player.position, collisionPosition as Position)) collisionMoveToObjectTest = true
        })
        game.on<IEntityCreatedCollisionData>('entityCreatedCollision', (o, e, d) => {
            collisionCreateTest = true
        })
        game.on<IObjectCreatedCollisionData>('objectCreatedCollision', (o, e, d) => {
            const { name } = d.eventData.object

            if (name === WALL) collisionCreateObjectTest = true
            else if (name === 'sword2') collisionByWeightTest = true
            else if (name === 'sword3') collisionByChestWeightTest = true
        })
        game.on<IMovedData>('entityMoved', (o, e, d) => {
           const { newPosition } = d.eventData

           if (positionIsPosition(newPosition)) {
             if (checkTwoPositions(newPosition, [2, 0])) moveToDoesntCollisionObjectTest = true
           }
        })
    })

    const PLAYER = 'PLAYER'
    const ZOMBIE = 'ZOMBIE'
    const WALL = 'WALL'

    let collisionCreateTest = false
    let collisionCreateObjectTest = false
    let collisionMoveToEntityTest = false
    let collisionMoveToObjectTest = false
    let moveToDoesntCollisionObjectTest = false
    let collisionByWeightTest = false
    let collisionByChestWeightTest = false
    
    it('Create entity in collision place', () => {
        manager.create({
            name: PLAYER,
            health: 10,
            damage: 10,
            isDead: false,
            position: [1, 0]
        })

        expect(collisionCreateTest).toBe(true)
    })

    it('Create object in collision place', () => {
        map.createObject({
            name: WALL,
            position: [0, 1],
            type: GameObjectEnum.WALL
        })

        expect(collisionCreateObjectTest).toBe(true)
    })

    it('Walk to collision entity', () => {
        zombie.move(player.position)

        expect(collisionMoveToEntityTest).toBe(true)
    })

    it('Walk to collision object', () => {
        player.move(wall.position)

        expect(collisionMoveToObjectTest).toBe(true)
    })

    it('Walk to doesnt collision object', () => {
        const sword = map.createObject({
            name: "sword",
            position: [2, 0],
            type: GameObjectEnum.ITEM
        }, {
            damage: 5
        })

        player.move(sword.position)

        expect(moveToDoesntCollisionObjectTest).toBe(true)
    })

    it('Collision by weight', () => {
        map.createObject({
            name: "sword",
            position: [2, 0],
            type: GameObjectEnum.ITEM
        }, {
            weight: 50
        })
        map.createObject({
            name: "sword2",
            position: [2, 0],
            type: GameObjectEnum.ITEM
        }, {
            weight: 51
        })

        expect(collisionByWeightTest).toBe(true)
    })
    it('Collision by chest weight', () => {
        const sword1 = map.createObject({
            name: "sword",
            position: [2, 0],
            type: GameObjectEnum.ITEM
        }, {
            weight: 50
        })
        const sword2 = map.createObject({
            name: "sword2",
            position: [2, 0],
            type: GameObjectEnum.ITEM
        }, {
            weight: 50
        })

        map.createObject({
            name: "chest",
            position: [2,1],
            type: GameObjectEnum.CHEST
        }, {
            items: [sword1, sword2]
        })
        map.createObject({
            name: "sword3",
            position: [2, 1],
            type: GameObjectEnum.ITEM
        }, {
            weight: 1
        })

        expect(collisionByChestWeightTest).toBe(true)
    })
})