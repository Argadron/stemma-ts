import type { IGameObject, ITarget } from "@interfaces";

/**
 * Util type for blueprint content
 */
export type BlueprintContent = Omit<ITarget, 'position'> | Omit<IGameObject, 'position'>