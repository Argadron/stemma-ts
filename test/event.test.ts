import { createGame, type Game } from "@"
import type { IEntityManager, IGameMap } from "@interfaces"
import type { Entity } from "@world"

describe('Event Tests', () => {
    let game!: Game
    let manager!: IEntityManager
    let map!: IGameMap

    let player!: Entity;
    let zombie!: Entity;

    let events = {
        subscribeToGame: false,
        unsubscribing: false,
        subscribeToCustom: false,
        unsubscribingCustom: false,
        snapshot: false
    }

    beforeEach(() => {
        const [g, m, mapInstance] = createGame()

        events = {
            subscribeToGame: false,
            unsubscribing: true,
            subscribeToCustom: false,
            unsubscribingCustom: true,
            snapshot: false
        }

        game = g
        manager = m
        map = mapInstance

        player = manager.create({ name: 'PLAYER', health: 10, damage: 5, isDead: false, position: [1, 0] })
        zombie = manager.create({ name: 'ZOMBIE', health: 10, damage: 10, isDead: false, position: [1, 1] })
    })

    it('Test subscribe to GameEvent and executing', () => {
        game.on('attack', (o, e, d) => {
            events.subscribeToGame = true
        })

        player.attack([zombie])

        expect(events.subscribeToGame).toBe(true)
    })
    it('Test subscribe to events and unsubscribe', () => {
        const attackEvent = game.on('attack', (o, e, d) => {
            events.unsubscribing = false
        })

        attackEvent()

        player.attack([zombie])

        expect(events.unsubscribing).toBe(true)
    })
    it('Test subscribe to custom event and executing', () => {
        game.registerCustomEvent('superAttack', (o, e, d) => {
            events.subscribeToCustom = true
        })

        game.processCustomEvent('superAttack', {
            eventData: {},
            eventTime: game.currentTick
        })

        expect(events.subscribeToCustom).toBe(true)
    })
    it('Test subscribe to custom events and unsubscribe', () => {
        const attackEvent = game.registerCustomEvent('superAttack', (o, e, d) => {
            events.unsubscribing = false
        })

        attackEvent()

        game.processCustomEvent('superAttack', {
            eventData: {},
            eventTime: game.currentTick
        })

        expect(events.unsubscribingCustom).toBe(true)
    })
    it('Test snapshot', () => {
        const snapshot = game.save()

        game.load(snapshot, () => events.snapshot = true)

        expect(events.snapshot).toBe(true)
    })
})