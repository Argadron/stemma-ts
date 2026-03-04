import type { IGameObject, ITarget } from "@interfaces"

/**
 * Checks a given blueprint value is Target (Entity)
 * @param blueprint - Blueprint to check
 * @returns { blueprint is ITarget } - True if blueprint value is Target, else false
 */
export function blueprintIsTarget(blueprint: ITarget | IGameObject): blueprint is ITarget {
    const anyBlueprint = blueprint as any

    return (anyBlueprint.isDead !== undefined)
}
