import type { Entity } from "@world";

export interface IEffect {
    /**
     * Optional effect power
     */
    readonly power?: number;

    /**
     * Effect name
     */
    readonly name: string;

    /**
     * What will do in next game tick (effect actions)
     * @param e - Entity, who has this effec
     * @returns { void }
     */
    readonly onTick: (e: Entity, effect: IEffect) => void;

    /**
     * What will do when effect end
     * @param e - Entity who has effect
     * @returns { void }
     */
    readonly onEnd?: (e: Entity, effect: IEffect) => void;
}

export interface IGameEffect extends IEffect {
    /**
     * ID of effect
     */
    readonly id: number;
}