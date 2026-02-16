import createGame from "@"
import { GameObjectEnum } from "@enums"
import type { CreateItemMetadata, CreateTowerMetadata } from "@types"

describe('Iteraction Tests', () => {
    const [game, manager, map] = createGame()

    const PLAYER = 'PLAYER'
    const ZOMBIE = 'ZOMBIE'
    const SWORD = 'SWORD'
    const TOWER = 'TOWER'

    let pickUpCorrectTest = false
    let pickUpErrorTest = false
    let attackTest = false
    let killTest = false
    
    const player = manager.create({
        name: PLAYER,
        health: 10,
        damage: 10,
        isDead: false,
        position: [1, 0]
    })
    const zombie = manager.create({
        name: ZOMBIE,
        health: 10,
        damage: 10,
        isDead: false,
        position: [1, 1]
    })

    const sword = map.createObject<CreateItemMetadata>({
        name: SWORD,
        type: GameObjectEnum.ITEM,
        position: [2, 0]
    }, {
        damageBuff: 10
    })
    const tower = map.createObject<CreateTowerMetadata>({
        name: TOWER,
        position: [0, 0],
        type: GameObjectEnum.TOWER
    }, {
        damage: 1
    })

    game.on('itemPickedUp', (o, e, d) => {
        pickUpCorrectTest = true
    })
    game.on('itemPickedUpError', (o, e, d) => {
        pickUpErrorTest = true
    })
    game.on('attack', (o, e, d) => {
        attackTest = true
    })
    game.on('entityDead', (o, e, d) => {
        killTest = true
    })

    it('Pick Up a Sword (correct)', () => {
        player.pickUp(sword.position)

        expect(pickUpCorrectTest).toBe(true)
    })
    it('Pick up a unknown item (uncorrect)', () => {
        player.pickUp([2, 2])

        expect(pickUpErrorTest).toBe(true)
    })
    it('Item buff check', () => {
        player.equipItem(sword)

        expect(player.damage).toBe(10)
        expect(player.fullDamage).toBe(20)
    })
    it('Attack test', () => {
        player.attack([zombie])

        expect(attackTest).toBe(true)
    })
    it('Shoot test', () => {
        const shoot = tower.shoot()

        let deaths = 0

        if (shoot) {
            deaths = shoot.deathsCounter
        }

        expect(deaths).toBe(1)
    })
    it('Kill test', () => {
        player.attack([zombie])

        expect(killTest).toBe(true)
    })
})