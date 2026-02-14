import { GameObjectEnum } from "@enums";
import createGame from "@";
import type { IAttackData, IItemCreatedErrorData, IItemPickedUpErrorData } from "@interfaces";
import type { CreateItemMetadata, Quad } from "@types";

const [game, manager, map] = createGame()

const PLAYER = 'PLAYER'
const ZOMBIE = 'ZOMBIE'

const gameQuad = [
    0, 0, 100, 100
] as Quad

const player = manager.create({
    damage: 1,
    health: 10,
    name: PLAYER,
    isDead: false,
    position: [5, 5]
})

const zombie = manager.create({
    damage: 1,
    health: 10,
    name: ZOMBIE,
    isDead: false,
    position: [4, 5]
})

game.on<IAttackData>('attack', (opts, event, data) => {
    console.log(data.eventData.victims)
})

const wall = map.createObject({
    position: [5, 4],
    type: GameObjectEnum.WALL,
    name: "стена"
})

console.log(map.getObject(wall.id))

interface TestEvent {
    readonly a: string
}

game.registerCustomEvent<TestEvent>('event', (opts, event, data) => {
    console.log(data.eventData.a)
})

game.processCustomEvent<TestEvent>('event', {
    eventTime: new Date(),
    eventData: {
        a: "привет"
    }
})

game.on<IItemCreatedErrorData>('itemCreatedError', (o, e, d) => {
    manager.delete(d.eventData.objectId)
})
game.on<IItemPickedUpErrorData>('itemPickedUpError', (o, e, d) => {
    console.log(d)
})

const sword = map.createObject<CreateItemMetadata>({
    name: "меч",
    position: [4, 4],
    type: GameObjectEnum.ITEM
}, {
    damageBuff: 5
})

player.pickUp([4, 4])
player.equipItem(sword)

console.log(player.attack())
console.log(player.move([5, 6]))
