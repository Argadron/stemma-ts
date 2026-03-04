import type { IChest, IGameObject, IWorldItem } from "@interfaces"
import type { Position } from "@types"
import { checkTwoPositions, convertGameObjectToInventoryItem, gameObjectIsChest, gameObjectIsItem } from "@utils"
import type { GameObject } from "@world"

/**
 * Return a Item in provided Position, else undefined if not found
 * @param position - Position to search
 * @param objects - GameObject to searching in
 * @returns {IWorldItem | undefined} - Item if found, else undefined
 */
export function getItemInPosition(position: Position, objects: (IWorldItem & IGameObject)[]): IWorldItem | undefined {
    const obj = objects.find((obj) => (checkTwoPositions(position, obj.position) && gameObjectIsItem(obj)))

    return obj ? convertGameObjectToInventoryItem(obj)  : undefined
}

/**
 * Return a Chest in provided Position, else undefined if not found
 * @param position - Position to search
 * @param objects - GameObject to searching in
 * @returns { IChest | undefined } - Chest if found, else undefined
 */
export function getChestInPosition(position: Position, objects: (GameObject)[]): (GameObject & IChest) | undefined {
    const obj =  objects.find((obj) => checkTwoPositions(obj.position, position))

    if (!obj) return undefined
    else return gameObjectIsChest(obj) ? obj : undefined
}