import type { Entity, GameObject } from "@world";

export interface IUseVisibilityContext {
    /**
     * Observer, who see target
     */
    readonly observer: Entity | GameObject;

    /**
     * Target to check
     */
    readonly target: Entity | GameObject;

    /**
     * Flag indicates, can observer see target
     */
    isVisible: boolean;

    /**
     * Factor, how well observer see target
     */
    factor: number;
}