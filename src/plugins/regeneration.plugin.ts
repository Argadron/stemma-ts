import type { Game } from "@core";
import { InjectCore, InjectLiveQuery, InjectLiveQueryObject, InjectStoreValue, OnCustomEvent, OnEvent, OnTick, When, OnTagAdded, OnTagDeleted, Chance, OnUIEvent, Menu } from "@decorators";
import type { IPlugin, IEventInfo, Signal } from "@interfaces";
import { anyWorldObjectIsGameObject } from "@utils";
import type { Entity, GameObject } from "@world"

/**
 * This is a example Regenration plugin (regenerate hp every second)
 */
export class RegenerationPlugin implements IPlugin {
    public readonly name = 'REGENERATION_PLUGIN'

    @InjectStoreValue(`REGENERATION_PLUGIN:health_regen_value`)
    private HEALTH_REGEN_VALUE: number;

    @InjectCore()
    private readonly core!: Game;

    @InjectLiveQuery({
        all: ['stunned'],
        includeDeaths: true
    })
    public matchingEntities!: Set<Entity>;

    @InjectLiveQueryObject({
        where: (o) => o.name === 'BLOCK'
    })
    public matchingObjects!: Set<GameObject>;

    private readonly REGENERATION_INTERVAL = 60;
    private readonly storePluginKey = `${this.name}:health_regen_value`
    private readonly signal?: Signal | undefined

    public constructor(health?: number, signal?: Signal) {
        this.HEALTH_REGEN_VALUE = health ?? 1
        this.signal = signal
        this.decorator()
        this.when()
        this.onStart({
            eventTime: 0,
            eventData: {}
        })
        this.listen()
    }

    @When({
        when: (game) => game.currentTick % 100 === 0
    }, 'signal')
    public when() {
        console.log('WHEN')
    }

    @OnTick({ interval: 100 })
    public tick(g: Game) {
        console.log('GAME!', this.core)
        if (g.currentTick % 10 === 0) g.options.store.set(this.storePluginKey, this.HEALTH_REGEN_VALUE++)
    }

    @OnEvent('gameStarted', 'signal')
    public onStart(data: IEventInfo<any>) {
        console.log('launched', data)
    }

    @OnUIEvent({ event: "click", id: "button" })
    public onUI(e: Event) {
        console.log(e.target, 'TARGET')
    }

    @Chance(50, 'signal')
    @OnCustomEvent('decorator', 'signal')
    public decorator() {
        console.log('DECORATOR EVENT')
    }

    @OnTagAdded({ tag: "stunned" }, 'signal')
    public listen() {
        console.log('LISTEN TAG')
    }

    @OnTagDeleted({ tag: "stunned" })
    public listenDelete() {
        console.log('LISTEN TAG DELETED')
    }

    @Menu()
    public *firstMenu(): Generator<any, void, string | null> {
        const choise = yield 'Ваш выбор?'

        console.log('ВЫБОР -', choise)
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
        else game.options.manager.entities.forEach((entity) => {
            if (!entity.isDead && entity.health) game.processCustomEvent('regenerate', {
                entity,
                eventTime: tick,
                eventData: {}
            })
        })
    }

    public afterTick() {}
}