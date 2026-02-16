import createGame from "@"
import { GameObjectEnum } from "@enums"
import type { IEntityCreatedCollisionData, IMovedCollisionData, IObjectCreatedCollisionData } from "@interfaces"
import { checkTwoPositions } from "@utils"
import type { Position } from "@types"

describe('Collisions Tests', () => {
    const [game, manager, map] = createGame()

    const PLAYER = 'PLAYER'
    const ZOMBIE = 'ZOMBIE'
    const WALL = 'WALL'

    let collisionCreateTest = false
    let collisionCreateObjectTest = false
    let collisionMoveToEntityTest = false
    let collisionMoveToObjectTest = false

    const player = manager.create({
        name: PLAYER,
        health: 10,
        damage: 10,
        isDead: false,
        position: [1, 0]
    })

    const zombie = manager.create({
        name: ZOMBIE,
        health: 10,
        damage: 10,
        isDead: false,
        position: [1, 1]
    })

    const wall = map.createObject({
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
        collisionCreateObjectTest = true
    })

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

    it('Walk to collision object', async () => {
        player.move(wall.position)

        expect(collisionMoveToObjectTest).toBe(true)
    })
})