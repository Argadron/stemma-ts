import type { Game } from "@";
import { InjectStoreValue, OnCustomEvent, OnEvent, OnTick } from "@decorators";
import type { IPlugin, IEventInfo } from "@interfaces";
import { anyWorldObjectIsGameObject } from "@utils";

/**
 * This is a example Regenration plugin (regenerate hp every second)
 */
export class RegenerationPlugin implements IPlugin {
    public readonly name = 'REGENERATION_PLUGIN'

    @InjectStoreValue(`REGENERATION_PLUGIN:health_regen_value`)
    private HEALTH_REGEN_VALUE: number;

    private readonly REGENERATION_INTERVAL = 60;
    private readonly storePluginKey = `${this.name}:health_regen_value`

    public constructor(health?: number) {
        this.HEALTH_REGEN_VALUE = health ?? 1
    }

    @OnTick({ interval: 100 })
    public tick(g: Game) {
        console.log(g.currentTick)
        console.log(this.HEALTH_REGEN_VALUE)

        if (g.currentTick % 10 === 0) g.options.store.set(this.storePluginKey, this.HEALTH_REGEN_VALUE++)
    }

    @OnEvent('gameStarted')
    public onStart(data: IEventInfo<any>) {
        console.log(data)
       console.log('LOGGING START')
    }

    @OnCustomEvent('decorator')
    public decorator() {
        console.log('DECORATOR EVENT')
    }

    public install(game: Game) {
        game.options.store.set(this.storePluginKey, this.HEALTH_REGEN_VALUE)
        game.registerCustomEvent('regenerate', (o, e, d) => {
            const entity = d.entity

            if (entity && !anyWorldObjectIsGameObject(entity)) entity.health += game.options.store.get<number>(this.storePluginKey) ?? this.HEALTH_REGEN_VALUE
        })

        return true
    }

    public beforeTick(game: Game) {
        const tick = game.currentTick

        if (tick % this.REGENERATION_INTERVAL !== 0) return;
        else game.options.entites.targets.forEach((entity) => {
            if (!entity.isDead && entity.health) game.processCustomEvent('regenerate', {
                entity,
                eventTime: tick,
                eventData: {}
            })
        })
    }

    public afterTick() {}
}