import createGame from "@";
import { GameObjectEnum } from "@enums";
import type { CreateItemMetadata, CreateTowerMetadata } from "@types";
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

    let events = {
        pickUpCorrect: false,
        pickUpError: false,
        attack: false,
        kill: false
    }

    beforeEach(() => {
        const [g, m, mapInstance] = createGame()

        game = g
        manager = m
        map = mapInstance

        events = { pickUpCorrect: false, pickUpError: false, attack: false, kill: false }

        player = manager.create({ name: 'PLAYER', health: 10, damage: 10, isDead: false, position: [1, 0] })
        zombie = manager.create({ name: 'ZOMBIE', health: 10, damage: 10, isDead: false, position: [1, 1] })

        sword = map.createObject<CreateItemMetadata>({
            name: 'SWORD', type: GameObjectEnum.ITEM, position: [2, 0]
        }, { damageBuff: 10 })

        tower = map.createObject<CreateTowerMetadata>({
            name: 'TOWER', position: [0, 0], type: GameObjectEnum.TOWER
        }, { damage: 10 })

        game.on('itemPickedUp', () => events.pickUpCorrect = true)
        game.on('itemPickedUpError', () => events.pickUpError = true)
        game.on('attack', () => events.attack = true)
        game.on('entityDead', () => events.kill = true)
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

        expect(player.damage).toBe(10)
        expect(player.fullDamage).toBe(20)
    })

    it('Kill test', () => {
        player.equipItem(sword)
        player.attack([zombie])

        expect(events.kill).toBe(true)
        expect(zombie.isDead).toBe(true)
    })
});
