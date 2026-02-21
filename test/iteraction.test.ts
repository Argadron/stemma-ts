import createGame from "@";
import { GameObjectEnum } from "@enums";
import type { CreateChestMetadata, CreateItemMetadata, CreateTowerMetadata, CreateUsableItemMetadata } from "@types";
import type { IEntityManager, IGameMap, IGame } from "@interfaces";
import type { Entity, GameObject } from "@world";

describe('Interaction Tests', () => {
    let game!: IGame;
    let manager!: IEntityManager;
    let map!: IGameMap;
    
    let player: Entity;
    let zombie: Entity;
    let sword: GameObject;
    let tower: GameObject;
    let magicSword: GameObject;
    let chest: GameObject;

    let events = {
        pickUpCorrect: false,
        pickUpError: false,
        using: false,
        attack: false,
        kill: false,
        chest: false
    }

    beforeEach(() => {
        const [g, m, mapInstance] = createGame()

        game = g
        manager = m
        map = mapInstance

        events = { pickUpCorrect: false, pickUpError: false, attack: false, kill: false, using: false, chest: false }

        player = manager.create({ name: 'PLAYER', health: 10, damage: 5, isDead: false, position: [1, 0] })
        zombie = manager.create({ name: 'ZOMBIE', health: 10, damage: 10, isDead: false, position: [1, 1] })

        sword = map.createObject<CreateItemMetadata>({
            name: 'SWORD', type: GameObjectEnum.ITEM, position: [2, 0]
        }, { damageBuff: 10 })

        magicSword = map.createObject<CreateUsableItemMetadata>({
            name: 'MAGIC_SWORD', type: GameObjectEnum.ITEM, position: [0, 0]
        }, { onUse: (e) => {
             events.using = true
             e.damage += 1
           }
         })

        chest = map.createObject<CreateChestMetadata>({
            name: "CHEST", type: GameObjectEnum.CHEST, position: [0, 1]
        }, {
            items: [magicSword]
        })

        tower = map.createObject<CreateTowerMetadata>({
            name: 'TOWER', position: [0, 0], type: GameObjectEnum.TOWER
        }, { damage: 10 })

        game.on('itemPickedUp', () => events.pickUpCorrect = true)
        game.on('itemPickedUpError', () => events.pickUpError = true)
        game.on('attack', () => events.attack = true)
        game.on('entityDead', () => events.kill = true)
        game.on('itemUsed', () => events.using = true)
        game.on('chestOpened', () => events.chest = true)
    })

    it('Pick Up a Sword (correct)', () => {
        player.pickUp(sword.position)

        expect(events.pickUpCorrect).toBe(true)
    })
    it('Shoot test', () => {
        const shoot = tower.shoot()

        let deaths = 0

        if (shoot) {
            deaths = shoot.deathsCounter
        }

        expect(deaths).toBe(2)
    })
    it('Item buff check', () => {
        player.pickUp(sword.position)
        player.equipItem(sword)

        expect(player.damage).toBe(5)
        expect(player.fullDamage).toBe(15)
    })
    it('Item use check', () => {
        player.pickUp(magicSword.position)
        player.equipItem(magicSword)
        player.useItem()

        expect(events.using).toBe(true)
        expect(player.damage).toBe(6)
    })
    it('Open chest', () => {
        player.openChest(chest.position)

        expect(events.chest).toBe(true)
    })
    it('Kill test', () => {
        player.pickUp(sword.position)
        player.equipItem(sword)
        player.attack([zombie])

        expect(events.kill).toBe(true)
        expect(zombie.isDead).toBe(true)
    })
});
