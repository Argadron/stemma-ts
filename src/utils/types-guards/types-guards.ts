import { GameObjectEnum } from "@enums"
import type { IGameObject, IWorldItem } from "@interfaces"
import type { AnyPosition, Quad } from "@types"

/**
 * Checks a given object is a really exists Item
 * @param obj - Any game object
 * @returns {obj is IGameObject & IWorldItem} - GameObject is Item
 */
export function gameObjectIsItem(obj: IGameObject): obj is IWorldItem & IGameObject {
    return obj.type === GameObjectEnum.ITEM && obj.metadata
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