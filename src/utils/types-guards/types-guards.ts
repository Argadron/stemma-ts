import { GameObjectEnum } from "@enums"
import type { IChest, IGameObject, ITarget, IWorldItem } from "@interfaces"
import type { AnyPosition, Position, Quad } from "@types"
import { GameObject, type Entity } from "@world"

/**
 * Checks a given object is a really exists Item
 * @param obj - Any game object
 * @returns {obj is IGameObject & IWorldItem} - GameObject is Item
 */
export function gameObjectIsItem(obj: IGameObject): obj is IWorldItem & IGameObject {
    return obj.type === GameObjectEnum.ITEM && obj.metadata
}

/**
 * Checks a given object is a really exists Chest
 * @param obj - Any game object
 * @returns { obj is IGameObject & IChest } - GameObject is Chest
 */
export function gameObjectIsChest(obj: IGameObject): obj is IChest & IGameObject {
    return obj.type === GameObjectEnum.CHEST && obj.metadata
}

/**
 * Checks a given world object is a GameObject
 * @param obj - Any world object
 * @returns { obj is GameObject } - World object is GameObject
 */
export function anyWorldObjectIsGameObject(obj: Entity | GameObject): obj is GameObject {
    const unknownWorldObject = obj as any

    return unknownWorldObject.type && unknownWorldObject.id
}

/**
 * Checks a given blueprint value is Target (Entity)
 * @param blueprint - Blueprint to check
 * @returns { blueprint is ITarget } - True if blueprint value is Target, else false
 */
export function blueprintIsTarget(blueprint: ITarget | IGameObject): blueprint is ITarget {
    const anyBlueprint = blueprint as any

    return (anyBlueprint.isDead !== undefined)
}

/**
 * Check AnyPosition is Quad
 * @param position - AnyPosition to check is Quad
 * @returns {boolean} True if position is Quad, else false
 */
export function positionIsQuad(position: AnyPosition): position is Quad {
    const [x, y, maxX, maxY] = position

    if (maxX === undefined || maxY === undefined) return false
    else {
        if (!isNaN(Number(x)) && !isNaN(Number(y)) && 
        !isNaN(Number(maxX)) && !isNaN(Number(maxY))) return true
        else return false
    }
}

/**
 * Check AnyPosition is Position
 * @param position - AnyPosition to check is Position
 * @returns { boolean } - True if position is Position, else false
 */
export function positionIsPosition(position: AnyPosition): position is Position {
    const [x, y] = position

    if (x === undefined || y === undefined) return false
    else return (!isNaN(x) && !isNaN(y) && position.length === 2) ? true : false
}