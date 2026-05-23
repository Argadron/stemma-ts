import { CanvasPlugin, CollisionGuard, CommandType, createGame } from 'stemma-ts'

const [game, manager, map] = createGame()

game.registerPlugin(new CanvasPlugin({
    canvas: document.getElementById('canvas') as HTMLCanvasElement,
    assets: {
        "hero": {
            src: "./hero.png",
            width: 100,
            height: 100
        }
    },
    render: {
        defaultColor: "red",
        defaultHeight: 50,
        defaultWidth: 20
    },
    width: 1000,
    height: 1000
}))

const player = manager.create({
    health: 10,
    damage: 1,
    name: "hero",
    isDead: false,
    position: [100, 100]
})
const player2 = manager.create({
    health: 10,
    damage: 1,
    name: "hero",
    isDead: false,
    position: [101, 101]
})

game.on('entityMovedCollision', (o, e, d) => {
    manager.delete(d.entity!.id)
})

game.use(CollisionGuard)
game.start()

setInterval(() => {
    game.dispatch({
        data: {
            position: [player.position[0]-1, player.position[1]-1]
        },
        tick: game.currentTick,
        type: CommandType.MOVE,
        entityId: player.id
    })
    game.dispatch({
        data: {
            position: [player2.position[0]+1, player2.position[1]+1]
        },
        tick: game.currentTick,
        type: CommandType.MOVE,
        entityId: player2.id
    })
}, 1000)