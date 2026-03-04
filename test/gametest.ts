import { CommandType, FactoryKeys, GameObjectEnum } from "@enums";
import createGame from "@";
import type { IAttackData, IItemPickedUpErrorData, IMovedData, IObjectCreatedCollisionData, IObjectCreatedErrorData, IUseValidationResult, IUseVisibilityContext } from "@interfaces";
import type { CreateChestMetadata, CreateItemMetadata, CreateTowerMetadata, Position, Quad } from "@types";
import { BASE_SEARCH_RADIUS, USE_VALIDATION_EVENT_PREFIX, USE_VISIBILITY_EVENT } from '@const'
import { BluePrintsFactory, EffectFactory, IteractionsFactory, QuestsFactory, SoundsFactory } from "@factories";
import { loggerMiddleware } from "@middlewares";
import { RegenerationPlugin } from "@plugins";
import { useVisibility, checkTwoPositions, useValidation } from "@utils";

const [game, manager, map] = createGame({
    usingEntityMiddlewares: true,
    usingObjectMiddlewares: true
})

game.use([loggerMiddleware])

game.options.store.set('isNight', true)

const PLAYER = 'PLAYER'
const PLAYER_SECOND = 'PLAYER_SECOND'
const ZOMBIE = 'ZOMBIE'
const BLOCK = 'BLOCK'
const TOWER = 'TOWER'

const effectFactory = game.connectFactory(FactoryKeys.EFFECTS, new EffectFactory())
const blueprintsFactory = game.connectFactory(FactoryKeys.BLUEPRINTS, new BluePrintsFactory({ game }))
const questsFactory = game.connectFactory(FactoryKeys.QUESTS, new QuestsFactory({ game }))
const iteractionFactory = game.connectFactory(FactoryKeys.ITERACTIONS, new IteractionsFactory({ game }))
const soundsFactory = game.connectFactory(FactoryKeys.SOUNDS, new SoundsFactory({ game }))

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

const SUPER_ZOMBIE = blueprintsFactory.register({
    name: 'SUPER_ZOMBIE',
    damage: 5,
    health: 10,
    isDead: false
})

const killQuest = questsFactory.create({
    name: "Move to 5,6",
    injectEvents: ['entityMoved'],
    onEvent: (options, event, data, self) => checkTwoPositions([5, 6], (data.eventData as IMovedData).newPosition as Position),
    onComplete: (e) => {
        console.log('QUEST COMPLETED FOR', e.name)
    }
})

const buffDamage = iteractionFactory.create({
    can: (e) => e.name === PLAYER,
    use: (e) => e.damage ++
})

blueprintsFactory.create([SUPER_ZOMBIE, SUPER_ZOMBIE], [[2,0], [5,0]])

const topSounds = soundsFactory.create({
    name: "DOOR_OPEN",
    category: "SFX",
    volume: 5
})

soundsFactory.play(topSounds.id)

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

const buffBlock = map.createObject({
    name: BLOCK,
    type: GameObjectEnum.BLOCK,
    position: [7, 6],
    iteractionId: buffDamage.id
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

questsFactory.activate(killQuest.id, player.id)

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
    eventTime: game.currentTick,
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

game.dispatch({
    type: CommandType.INTERACT_POSITION,
    tick: game.currentTick,
    entityId: player.id,
    data: {
        position: buffBlock.position
    }
})

console.log('INTERACT', player.damage)
console.log(player.attack())
console.log(player.move([5, 6]))
console.log('NEAR', player.getNearEntitiesAndObjects(BASE_SEARCH_RADIUS, 'OBJECTS'))
console.log(tower.shoot())
console.log(map.checkObjectOk(wall.id))
console.log(manager.checkEntityOk(player.id))

testEvent()

game.processCustomEvent('event', {
    eventTime: game.currentTick,
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

console.log(player)

console.log(map.game.getFactory<EffectFactory>(FactoryKeys.EFFECTS).get(poisonEffect.id))
console.log(map.game.getFactory<BluePrintsFactory>(FactoryKeys.BLUEPRINTS).get(SUPER_ZOMBIE.id))
console.log(map.game.getFactory<QuestsFactory>(FactoryKeys.QUESTS).get(killQuest.id))
console.log(map.game.getFactory<IteractionsFactory>(FactoryKeys.ITERACTIONS).get(buffDamage.id))
console.log(map.game.getFactory<SoundsFactory>(FactoryKeys.SOUNDS).get(topSounds.id))

const snapshot = game.save((snapshot) => {
    console.log(snapshot.state)
    console.log('CORRECT SNAPSHOT, entities:', snapshot.entities.length)
})

console.log(game.options.store.get('isNight'))

game.dispatch({
    type: CommandType.USE_ITEM,
    entityId: player.id,
    tick: game.currentTick,
    data: {
        
    }
})
game.dispatch({
    type: CommandType.SET_ENTITY_TAG,
    isSystem: true,
    entityId: player.id,
    tick: game.currentTick,
    data: {
        tag: 'stunned'
    }
})
game.registerPlugin(new RegenerationPlugin(20))
map.createObject({
    name: BLOCK,
    type: GameObjectEnum.BLOCK,
    position: [7, 10],
})

console.log(player.hasTag('stunned'), 'stunned')
console.log(game.getPlugin('customLogger'))

game.processCustomEvent('decorator', {
    eventData: {},
    eventTime: game.currentTick
})

game.registerCustomEvent<IUseVisibilityContext>(USE_VISIBILITY_EVENT, (o, e, d) => {
    d.eventData.factor = 0
})
game.registerCustomEvent<IUseValidationResult>(`${USE_VALIDATION_EVENT_PREFIX}:${CommandType.USE_ITEM}`, (o, e, d) => {
    d.eventData.errors.push('OUT OF REACH')
})

console.log(useVisibility(game, player, player_second))
console.log(useValidation(game, player, CommandType.USE_ITEM, {
    forTest: true
}))

game.start(60)

await new Promise((resolve, reject) => setTimeout(resolve, 5000))

game.stop()

game.load(snapshot, (game) => {
    console.log(game.options.store.get('isNight')) 
})

game.dispatch({
    type: CommandType.SET_STATE,
    tick: game.currentTick,
    data: {
        key: 'isNight',
        value: false
    }
})

game.options.undoManager.undo()

console.log(game.options.store.get('isNight'))