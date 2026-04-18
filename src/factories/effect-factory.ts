import type { IEffect, IEffectFactory, IGameEffect } from "@interfaces";
import { createId } from "@utils";

export class EffectFactory implements IEffectFactory {
    /**
     * Map of all effects
     */
    private readonly effects = new Map<number, IGameEffect>();

    public create(effect: IEffect): IGameEffect {
        const createdEffect: IGameEffect = {
            id: createId(),
            ...effect
        }

        this.effects.set(createdEffect.id, createdEffect)

        return createdEffect
    }

    public get(id: number): IGameEffect | undefined {
        return this.effects.get(id)
    }
}