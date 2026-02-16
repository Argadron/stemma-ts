import createGame from "@"
import { Entity } from "@world"

describe('Manager Tests', () => {
    const [game, manager, map] = createGame()

    const PLAYER = 'PLAYER'

    const player = manager.create({
        name: PLAYER,
        health: 10,
        damage: 10,
        isDead: false,
        position: [1, 0]
    })

    it('Create entity', () => {
        expect(manager.create({
            name: "entity",
            health: 10,
            isDead: false,
            position: [1, 2],
            damage: 10
        }).attack).toBeDefined()
    })
    it('Get entity', () => {
        expect(manager.get(player.id)).toBeInstanceOf(Entity)
    })
    it('Update entity', () => {
        expect(manager.update(player.id, {
            damage: 1
        })?.damage).toBe(1)
    })
    it('Check entity OK', () => {
        expect(manager.checkEntityOk(player.id)).toBe(true)
    })
    it('Kill entity', () => {
        expect(manager.kill(player.id)).toBe(true)
    })
    it('Delete entity', () => {
        expect(manager.delete(player.id)).toBe(true)
    })
})