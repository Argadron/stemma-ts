import type { Entity, GameObject } from "@world"

/**
 * Checks a given world object is a GameObject
 * @param obj - Any world object
 * @returns { obj is GameObject } - World object is GameObject
 */
export function anyWorldObjectIsGameObject(obj: Entity | GameObject): obj is GameObject {
    const unknownWorldObject = obj as any

    return unknownWorldObject.type && unknownWorldObject.metadata
}
