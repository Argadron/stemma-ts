import { GameObjectEnum } from "./enums/index.js";
import createGame from "./index.js";
import type { IAttackData, IItemPickedUpErrorData, IObjectCreatedErrorData } from "./interfaces/index.js";
import type { CreateItemMetadata, CreateTowerMetadata, Quad } from "./types/index.js";
import { BASE_SEARCH_RADIUS } from './const/index.js'

const [game, manager, map] = createGame()

const PLAYER = 'PLAYER'
const ZOMBIE = 'ZOMBIE'
const TOWER = 'TOWER'

const gameQuad = [
    0, 0, 100, 100
] as Quad

game.on<IObjectCreatedErrorData<CreateTowerMetadata>>('towerCreatedError', (o, e, d) => {
    console.log(map.deleteObject(d.eventData.objectId))
})

const tower = map.createObject<CreateTowerMetadata>({
    name: TOWER,
    position: [6, 5],
    type: GameObjectEnum.TOWER
}, {
    damage: 50
})

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

const testEvent = game.registerCustomEvent<TestEvent>('event', (opts, event, data) => {
    console.log(data.eventData.a)
})

game.processCustomEvent<TestEvent>('event', {
    eventTime: new Date(),
    eventData: {
        a: "привет"
    }
})

game.on<IObjectCreatedErrorData>('itemCreatedError', (o, e, d) => {
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
console.log('NEAR', player.getNearEntitiesAndObjects(BASE_SEARCH_RADIUS, 'OBJECTS'))
console.log(tower.shoot())
console.log(map.checkObjectOk(wall.id))
console.log(manager.checkEntityOk(player.id))

testEvent()

game.processCustomEvent('event', {
    eventTime: new Date(),
    eventData: {
        a: "привет"
    }
})