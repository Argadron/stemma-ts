import { createGame, type Game } from "stemma-ts";
import { 
    InjectLiveQuery, 
    InjectStoreValue,
    OnTick 
} from "stemma-ts";
import type { IPlugin } from "stemma-ts";
import { anyWorldObjectIsGameObject } from "stemma-ts";
import type { Entity } from "stemma-ts";

const [game] = createGame()

/**
 * REGENERATION PLUGIN (v1.1.0)
 * Level: Middle
 * Features: Reactive by LiveQuery and external control from Store.
 */
class RegenerationPlugin implements IPlugin {
    public readonly name = 'REGENERATION_PLUGIN'

    // 1. Take regen value from global store (InjectStoreValue)
    @InjectStoreValue(`REGENERATION_PLUGIN:health_regen_value`)
    public HEALTH_REGEN_VALUE: number

    // 2. Reactive list: only alive players who need regen
    @InjectLiveQuery({
        all: ['player'],      // Только те, у кого есть тег 'player'
        none: ['dead'],        // Исключаем мертвых
        where: (e) => e.health < 100 // Только раненые
    })
    public woundedEntities!: Set<Entity>

    private readonly storeKey = `${this.name}:health_regen_value`

    constructor(initialRegen: number = 1) {
        this.HEALTH_REGEN_VALUE = initialRegen
    }

    /**
     * Enrtypoint: init config in Store and register logic
     */
    public install(game: Game) {
        // Init first value in store to allow any plugins rewrite it
        game.options.store.set(this.storeKey, this.HEALTH_REGEN_VALUE)

        // Register custom event for heal
        game.registerCustomEvent<any>('apply_regeneration', (o, e, d) => {
            const entity = d.eventData.entity as Entity
            const regenAmount = game.options.store.get<number>(this.storeKey) ?? 1

            if (entity && !anyWorldObjectIsGameObject(entity)) {
                entity.health = Math.min(100, entity.health + regenAmount)
            }
        });

        return true
    }

    /**
     * Auto tick (second / 60 тиков)
     * Use LiveQuery
     */
    @OnTick({ interval: 60 })
    public processRegen(game: Game) {
        if (this.woundedEntities.size === 0) return

        this.woundedEntities.forEach((entity) => {
            game.processCustomEvent('apply_regeneration', {
                eventTime: game.currentTick,
                eventData: { entity }
            })
        })
    }

    public beforeTick() {}
    public afterTick() {}
}

game.registerPlugin(new RegenerationPlugin(5))

game.start(60)

await new Promise((resolve) => setTimeout(resolve, 5000))

game.stop()