import createGame from "@"
import type { CreateItemMetadata, Quad } from "@types"
import { GameObjectEnum } from "@enums"

describe('Map Tests', () => {
    const [game, manager, map] = createGame()

    const SWORD = 'SWORD'

    const testQuad = [0, 0, 10, 10] as Quad
    const testFailQuad = [50, 50, 50, 50] as Quad

    const sword = map.createObject<CreateItemMetadata>({
        name: SWORD,
        type: GameObjectEnum.ITEM,
        position: [2, 0]
    }, {
        damageBuff: 10
    })

    it('Create object', () => {
        expect(map.createObject({
            name: "object",
            position: [1, 0],
            type: GameObjectEnum.BLOCK
        }).shoot).toBeDefined()
    })
    it('Check object is OK', () => {
        expect(map.checkObjectOk(sword.id)).toBe(true)
    })
    it('Get object', () => {
        expect(map.getObject(sword.id)).toBeDefined()
    })
    it('Get objects in Quad', () => {
        expect(map.getInQuad(testQuad, 'OBJECTS')).toHaveLength(2)
    })
    it('Get all items', () => {
        expect(map.getAllItems()).toHaveLength(1)
    })
    it('Delete object', () => {
        expect(map.deleteObject(sword.id)).toBe(true)
    })
})