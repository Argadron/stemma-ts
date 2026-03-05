import createGame, { GameObjectEnum, CommandType } from "stemma-ts";
import type { 
    IObjectCreatedErrorData, 
    IObjectCreatedCollisionData, 
    IMovedData,
    Position 
} from "stemma-ts";

/**
 * JUNIOR LEVEL: "Stemma as toolkit library"
 * We just call methos and listen events in main loop
 */

// 1. Core init
const [game, manager, map] = createGame({
    usingEntityMiddlewares: true,
    usingObjectMiddlewares: true
});

// 2. Setup global state
game.options.store.set('isNight', false)
game.options.store.set('difficulty', 'normal')

// 3. Error handling
// If object cant be created by collision
game.on<IObjectCreatedCollisionData>('objectCreatedCollision', (o, e, d) => {
    console.warn(`[MAP] Cant place object ${d.eventData.object.name}: collision`)
    map.deleteObject(d.eventData.object.id) // Delete "ghost"
})

// If system error occured
game.on<IObjectCreatedErrorData>('towerCreatedError', (o, e, d) => {
    console.error(`[SYSTEM] Error in creating tower ${d.eventData.objectId}`)
})

// 4. Static and interact objects
const tower = map.createObject({
    name: "Just tower",
    position: [10, 10],
    type: GameObjectEnum.TOWER
}, {
    damage: 15,
    range: 5
})

const healingWell = map.createObject({
    name: "Just block",
    position: [5, 5],
    type: GameObjectEnum.BLOCK
});

// 5. Create game entities
const player = manager.create({
    name: 'Player_1',
    health: 100,
    damage: 10,
    isDead: false,
    position: [0, 0]
})

const zombie = manager.create({
    name: 'Basic_Zombie',
    health: 30,
    damage: 5,
    isDead: false,
    position: [2, 2]
})

// 6. Manipulation by dispatch
// Move command
game.dispatch({
    type: CommandType.MOVE,
    entityId: player.id,
    tick: game.currentTick,
    data: {
        position: [5, 4] as Position
    }
})

// Listen moving, to start logic
game.on('entityMoved', (o, e, d) => {
    const movedData = d.eventData as IMovedData;
    console.log(`[WORLD] ${movedData.entity.id} go to ${movedData.newPosition}`)
})

// 7. Simple interact check (In Junior style)
// Проверяем, кто рядом с игроком через Spatial Grid (наша киллер-фича!)
const nearby = player.getNearEntitiesAndObjects(3, 'ALL')
console.log('Objects and entities near radius 3 from player:', nearby)

// 8. Items using
const sword = map.createObject({
    name: "Super sword",
    position: [5, 4],
    type: GameObjectEnum.ITEM
}, {
    damageBuff: 20
})

player.pickUp([5, 4]) // Pick up a sword from world
player.equipItem(sword) // Equipping

// 9. Life-cycle (Tick)
// In junior style we just run a game
game.start()

console.log(`[STATUS] Game started. Current player HP: ${player.health}`)
console.log(`[STATUS] Player has item: ${player.inventory.length > 0}`)
