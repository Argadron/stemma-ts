import { GameObjectEnum } from "./enums/index.js";
import createGame from "./index.js";
import type { IAttackData, IItemPickedUpErrorData, IObjectCreatedCollisionData, IObjectCreatedErrorData } from "./interfaces/index.js";
import type { CreateChestMetadata, CreateItemMetadata, CreateTowerMetadata, Quad } from "./types/index.js";
import { BASE_SEARCH_RADIUS } from './const/index.js'
import { EffectFactory } from "@factories";

const [game, manager, map] = createGame()

const PLAYER = 'PLAYER'
const PLAYER_SECOND = 'PLAYER_SECOND'
const ZOMBIE = 'ZOMBIE'
const TOWER = 'TOWER'

const effectFactory = game.connectFactory('effect', new EffectFactory())

const poisonEffect = effectFactory.create({
    name: "POISON",
    onTick: (e) => {
       if (e.health > 0) {
          e.health --
       }
       else {
            e.isDead = true

            return
       }
    }
})

const gameQuad = [
    0, 0, 100, 100
] as Quad

game.on<IObjectCreatedErrorData<CreateTowerMetadata>>('towerCreatedError', (o, e, d) => {
    console.log(map.deleteObject(d.eventData.objectId))
})
game.on<IObjectCreatedErrorData<CreateChestMetadata>>('chestCreatedError', (o, e, d) => {
    console.log(map.deleteObject(d.eventData.objectId))
})
game.on<IObjectCreatedCollisionData>('objectCreatedCollision', (o, e, d) => {
    console.log(map.deleteObject(d.eventData.object.id))
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

const player_second = manager.create({
    damage: 1,
    health: 10,
    name: PLAYER_SECOND,
    isDead: false,
    position: [6, 7]
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

const sword2 = map.createObject<CreateItemMetadata>({
    name: "меч",
    position: [4, 4],
    type: GameObjectEnum.ITEM
}, {
    damageBuff: 5
})
const sword3 = map.createObject<CreateItemMetadata>({
    name: "меч магии",
    position: [4, 4],
    type: GameObjectEnum.ITEM
}, {
    damageBuff: 50, weight: 20
})

const chest = map.createObject<CreateChestMetadata>({
    name: "сундук",
    position: [6, 7],
    type: GameObjectEnum.CHEST
}, {
    items: [sword]
})

const chest2 = map.createObject<CreateChestMetadata>({
    name: "сундук",
    position: [6, 6],
    type: GameObjectEnum.CHEST
}, {
    items: [sword, sword3.id]
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

console.log(map.checkObjectOk(chest.id))
console.log(map.checkObjectOk(chest2.id))
console.log(map.checkObjectOk(sword2.id))
console.log(map.checkObjectOk(sword3.id))

player_second.openChest(chest2.position)
console.log(player_second.inventory)
console.log(player_second.walkBuff)
console.log(player_second.dropItem(sword3, [7, 7]))
console.log(player_second.inventory)
console.log(map.checkObjectOk(sword3.id))
console.log(map.getObject(sword3.id))

player.applyEffect(poisonEffect, 50)

console.log(map.game.getFactory<EffectFactory>('effect').get(poisonEffect.id))

game.start(60)

await new Promise((resolve, reject) => setTimeout(resolve, 5000))

game.stop()