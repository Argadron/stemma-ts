import createGame, { Game } from "@";
import { CommandType, GameObjectEnum } from "@enums";
import type { CreateChestMetadata, CreateItemMetadata, CreateTowerMetadata, CreateTriggerMetadata, CreateUsableItemMetadata } from "@types";
import type { IEntityManager, IGameMap, IDeadData, ITowerShootedData } from "@interfaces";
import type { Entity, GameObject } from "@world";
import { EffectFactory } from "@factories";
import { TIMES_60, wait60fps } from "./utils";
import {  DropItemGuard, EquipItemGuard, MovementGuard, OpenChestGuard, PickUpGuard, ShootGuard, UseItemGuard } from "@middlewares";

describe('Interaction Tests', () => {
    let game!: Game;
    let manager!: IEntityManager;
    let map!: IGameMap;
    
    let player: Entity;
    let zombie: Entity;
    let sword: GameObject;
    let tower: GameObject;
    let magicSword: GameObject;
    let chest: GameObject;
    let trigger: GameObject;

    let events = {
        pickUpCorrect: false,
        pickUpError: false,
        using: false,
        attack: false,
        kill: false,
        chest: false,
        weight: false,
        drop: false,
        trigger: false,
        noise: false,
        effect: false,
        sensor: false,
        deaths: 0
    }

    beforeEach(() => {
        const [g, m, mapInstance] = createGame()

        game = g
        manager = m
        map = mapInstance

        events = { 
            pickUpCorrect: false, 
            pickUpError: false, 
            attack: false, 
            kill: false, 
            using: false, 
            chest: false,
            weight: false,
            drop: false,
            trigger: false,
            noise: false,
            effect: false,
            sensor: false,
            deaths: 0
        }

        player = manager.create({ name: 'PLAYER', health: 10, damage: 5, isDead: false, position: [1, 0] })
        zombie = manager.create({ name: 'ZOMBIE', health: 10, damage: 10, isDead: false, position: [1, 1] })

        sword = map.createObject<CreateItemMetadata>({
            name: 'SWORD', type: GameObjectEnum.ITEM, position: [2, 0]
        }, { damageBuff: 10, weight: 20 })

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

        trigger = map.createObject<CreateTriggerMetadata>({
            name: "TRIGGER", position: [3,0], type: GameObjectEnum.TRIGGER
        }, {
            real: GameObjectEnum.WALL,
            trigger: (e, o) => events.trigger = true,
            isSensor: true
        })

        game.on('itemPickedUp', () => events.pickUpCorrect = true)
        game.on('itemPickedUpError', () => events.pickUpError = true)
        game.on('attack', () => events.attack = true)
        game.on('entityDead', () => events.kill = true)
        game.on('itemUsed', () => events.using = true)
        game.on('chestOpened', () => events.chest = true)
        game.on('entityMovedOutOfRange', () => events.weight = true)
        game.on('itemDropping', () => events.drop = true)
        game.on('gameObjectHearedNoise', () => events.noise = true)
        game.on('triggerSensorActive', () => events.sensor = true)
        game.on<ITowerShootedData>('towerShooted', (o, e, d) => events.deaths = d.eventData.deathsCount)

        game.use([MovementGuard, UseItemGuard, DropItemGuard, PickUpGuard, EquipItemGuard, OpenChestGuard, ShootGuard])
    })

    it('Pick Up a Sword (correct)', () => {
        game.dispatch({
            type: CommandType.PICKUP,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                position: sword.position
            }
        })

        expect(events.pickUpCorrect).toBe(true)
    })
    it('Drop test', () => {
        game.dispatch({
            type: CommandType.PICKUP,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                position: sword.position
            }
        })
        
        game.dispatch({
            type: CommandType.DROP_ITEM,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                item: sword,
                position: [2, 0]
            }
        })

        expect(events.drop).toBe(true)
    })
    it('Dead and drop inventory test', () => {
        game.dispatch({
            type: CommandType.PICKUP,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                position: magicSword.position
            }
        })

        game.on<IDeadData>('entityDead', (o, e, d) => {
            manager.delete(d.eventData.entity.id)
        })

        manager.kill(player.id)

        expect(map.checkObjectOk(magicSword.id)).toBe(true)
    })
    it('Shoot test', () => {
        game.dispatch({
            type: CommandType.TOWER_SHOOT,
            tick: game.currentTick,
            objectId: tower.id,
            data: {}
        })

        expect(events.deaths).toBe(2)
    })
    it('Item buff check', () => {
        game.dispatch({
            type: CommandType.PICKUP,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                position: sword.position
            }
        })
        game.dispatch({
            type: CommandType.EQUIP_ITEM,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                item: sword
            }
        })

        expect(player.damage).toBe(5)
        expect(player.fullDamage).toBe(15)
    })
    it('Item use check', () => {
        game.dispatch({
            type: CommandType.PICKUP,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                position: magicSword.position
            }
        })
        game.dispatch({
            type: CommandType.EQUIP_ITEM,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                item: magicSword
            }
        })
        
        game.dispatch({
            type: CommandType.USE_ITEM,
            entityId: player.id,
            tick: game.currentTick,
            data: {}
        })

        expect(events.using).toBe(true)
        expect(player.damage).toBe(6)
    })
    it('Open chest', () => {
        game.dispatch({
            type: CommandType.OPEN_CHEST,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                position: chest.position
            }
        })

        expect(events.chest).toBe(true)
    })
    it('Move with weight', () => {
        game.dispatch({
            type: CommandType.MOVE,
            entityId: player.id,
            tick: game.currentTick,
            data: {
                position: [2, 0]
            }
        })
        game.dispatch({
            type: CommandType.PICKUP,
            entityId: player.id,
            tick: game.currentTick,
            data: {
                position: sword.position
            }
        })
        game.dispatch({
            type: CommandType.MOVE,
            entityId: player.id,
            tick: game.currentTick,
            data: {
                position: [1, 0]
            }
        })
        
        expect(events.weight).toBe(true)
    })
    it('Kill test', () => {
        game.dispatch({
            type: CommandType.PICKUP,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                position: sword.position
            }
        })
        game.dispatch({
            type: CommandType.EQUIP_ITEM,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                item: sword
            }
        })
        game.dispatch({
            type: CommandType.ATTACK,
            tick: game.currentTick,
            entityId: player.id,
            data: {
                entities: [zombie]
            }
        })

        expect(events.kill).toBe(true)
        expect(zombie.isDead).toBe(true)
    })
    it('Activate trigger test', () => {
        game.dispatch({
            type: CommandType.MOVE,
            entityId: player.id,
            tick: game.currentTick,
            data: {
                position: [2, 0]
            }
        })
        game.dispatch({
            type: CommandType.MOVE,
            entityId: player.id,
            tick: game.currentTick,
            data: {
                position: [3, 0]
            }
        })

        expect(events.trigger).toBe(true)
    })
    it('Heard noise test', () => {
        game.dispatch({
            type: CommandType.MOVE,
            entityId: player.id,
            tick: game.currentTick,
            data: {
                position: [2, 0]
            }
        })

        expect(events.noise).toBe(true)
    })
    it('Effect test', async () => {
        const factory = new EffectFactory()

        const poisonEffect = factory.create({
            name: "POISON",
            onTick: (e, effect) => {
                e.health -= effect.power ?? 1
            },
            onEnd: () => events.effect = true,
            power: 2
        })

        player.applyEffect(poisonEffect, 50)

        await wait60fps(game, TIMES_60.TWO_SECONDS)

        expect(events.effect).toBe(true)
        expect(player.health).toBeLessThan(10)
    })
    it('Sensors test', async () => {
        game.dispatch({
            type: CommandType.MOVE,
            entityId: player.id,
            tick: game.currentTick,
            data: {
                position: [2, 0]
            }
        })
        game.dispatch({
            type: CommandType.MOVE,
            entityId: player.id,
            tick: game.currentTick,
            data: {
                position: [3, 0]
            }
        })

        await wait60fps(game, TIMES_60.TWO_SECONDS)

        expect(events.sensor).toBe(true)
    })
});
