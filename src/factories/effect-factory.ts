import type { IEffect, IEffectFactory, IGameEffect } from "@interfaces";
import { createId } from "@utils";

export class EffectFactory implements IEffectFactory {
    /**
     * Array of all effects
     */
    private readonly effects: IGameEffect[]= [];

    public create(effect: IEffect): IGameEffect {
        const createdEffect: IGameEffect = {
            id: createId(),
            ...effect
        }

        this.effects.push(createdEffect)

        return createdEffect
    }

    public get(id: number): IGameEffect | undefined {
        return this.effects.find((effect) => effect.id === id)
    }
}