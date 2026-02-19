import type { IGameObject, IWorldItem } from "@interfaces";
import type { Position } from "@types";
import { checkTwoPositions, gameObjectIsItem } from "@utils";

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
 * @returns {IWorldItem | undefined} - Item is found, else undefined
 */
export function getItemInPosition(position: Position, objects: (IWorldItem & IGameObject)[]): IWorldItem | undefined {
    const obj = objects.find((obj) => (checkTwoPositions(position, obj.position) && gameObjectIsItem(obj)))

    return obj ? {
        id: obj.id,
        isActive: false,
        name: obj.name,
        position: obj.position,
        damageBuff: obj.metadata.damageBuff ?? 0,
        healthBuff: obj.metadata.healthBuff ?? 0,
        walkBuff: obj.metadata.walkBuff ?? 0,
        metadata: obj.metadata ?? {}
    } as IWorldItem : undefined
}