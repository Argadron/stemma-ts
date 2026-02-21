import type { IChest, IGameObject, IWorldItem } from "@interfaces";
import type { Position } from "@types";
import { 
    checkTwoPositions, 
    checkTwoQuads, 
    convertGameObjectToInventoryItem, 
    createQuadFromPosition, 
    gameObjectIsChest, 
    gameObjectIsItem 
} from "@utils";
import type { Entity, GameObject } from "@world";

/**
 * Generate random ID
 * @returns {number} - A random id
 */
export function createId(): number {
    return Math.floor((Math.random() * 10000) + Date.now())
}

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

/**
 * Checks a given entity can iteract wtih given position
 * @param entity - Entity to check
 * @param iteractPosition - Position to check
 * @returns { boolean } - True if entity can iteract with given position
 */
export function canIteract(entity: Entity, iteractPosition: Position): boolean {
    return checkTwoQuads(createQuadFromPosition(iteractPosition), createQuadFromPosition(entity.position, 2))
}