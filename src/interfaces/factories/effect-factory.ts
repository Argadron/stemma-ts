import type { IEffect, IGameEffect } from "@interfaces";

export interface IEffectFactory {
    /**
     * Create new effect
     * @param effect - Effect data
     * @returns { IGameEffect } - Created effect
     */
    readonly create: (effect: IEffect) => IGameEffect;

    /**
     * Get one game effect by id
     * @param id - ID of effect
     * @returns { IGameEffect | undefined } GameEffect if founded, else undefined
     */
    readonly get: (id: number) => IGameEffect | undefined;
}