import { GameObjectEnum } from "@enums"
import type { IChest, IGameObject, IWorldItem } from "@interfaces"

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