import createGame, { Game } from "@"
import type { CreateItemMetadata, Quad } from "@types"
import { CommandType, FactoryKeys, GameObjectEnum } from "@enums"
import { Entity, GameObject } from "@world"
import type { IEntityManager, IGameMap } from "@interfaces"
import { EffectFactory } from "@factories"
import { createQuadFromPosition } from "@utils"
import { TIMES_60, wait60fps } from "./utils"

describe('Map Tests', () => {
    let game!: Game;
    let manager!: IEntityManager;
    let map!: IGameMap

    const SWORD = 'SWORD'

    const testQuad = [0, 0, 10, 10] as Quad
    const testFailQuad = [50, 50, 50, 50] as Quad

    let sword!: GameObject
    let player!: Entity

    let effectAreaTest = false

    beforeEach(() => {
        const [g, m, mapInstance] = createGame()

        game = g
        manager = m
        map = mapInstance

        effectAreaTest = false

        sword = map.createObject<CreateItemMetadata>({
            name: SWORD,
            type: GameObjectEnum.ITEM,
            position: [2, 0]
        }, {
            damageBuff: 10
        })

        player = manager.create({ name: 'PLAYER', health: 10, damage: 5, isDead: false, position: [1, 0] })
    })

    it('Create object', () => {
        game.dispatch({
            type: CommandType.CREATE_OBJECT,
            tick: game.currentTick,
            data: {
                object: {
                    name: "object",
                    position: [1, 0],
                    type: GameObjectEnum.BLOCK
                }
            }
        })

        expect(map.getAllInPosition([1, 0]).length).toBeGreaterThan(0)
    })
    it('Check object is OK', () => {
        expect(map.checkObjectOk(sword.id)).toBe(true)
    })
    it('Get object', () => {
        expect(map.getObject(sword.id)).toBeDefined()
    })
    it('Get objects in Quad', () => {
        expect(map.getInQuad(testQuad, 'OBJECTS')).toHaveLength(1)
    })
    it('Get all items', () => {
        expect(map.getAllItems()).toHaveLength(1)
    })
    it('Delete object', () => {
        expect(map.deleteObject(sword.id)).toBe(true)
    })
    it('Apply effect to quad', async () => {
        const factory = game.connectFactory(FactoryKeys.EFFECTS, new EffectFactory())
        const poisonEffect = factory.create({
            name: "POISON",
            onTick: (e) => e.health --,
            onEnd: () => effectAreaTest = true,
        })

        map.applyEffectToQuad(createQuadFromPosition(player.position), poisonEffect, 10)

        await wait60fps(game, TIMES_60.TWO_SECONDS)

        expect(effectAreaTest).toBe(true)
        expect(player.health).toBe(0)
    })
})