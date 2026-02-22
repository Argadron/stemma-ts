import type { AnyPosition, Position } from "@types"
import { getCenter, positionIsQuad } from "@utils"
import type { Entity, GameObject } from "@world"
import type { IWorldItem } from "@interfaces"

/**
 * Convert array of Targets to Positions format [[x, y], [x,y]]...
 * @param entities - Targets to convert
 * @returns {Position[]} - Converted positions
 */
export function convertEntitiesToPositionsArrays(entities: Entity[]): Position[] {
    const result = []

    for (const entity of entities) {
        result.push(entity.position)
    }

    return result
}

/**
 * Convert AnyPosition to Position (get center, is quad)
 * @param anyPosition - Quad or Position (unknown)
 * @returns {Position} - A concrete position
 */
export function convertAnyPositionToPosition(anyPosition: AnyPosition): Position {
    return positionIsQuad(anyPosition) ? getCenter(anyPosition) : anyPosition
}

/**
 * Convert GameObject to Inventory Item
 * @param obj - Object to convert
 * @returns { IWorldItem } - Inventory Item
 */
export function convertGameObjectToInventoryItem(obj: IWorldItem | GameObject): IWorldItem {
    return {
        id: obj.id,
        name: obj.name,
        position: obj.position,
        damageBuff: obj.metadata?.damageBuff ?? 0,
        healthBuff: obj.metadata?.healthBuff ?? 0,
        walkBuff: obj.metadata?.walkBuff ?? 0,
        weight: obj.metadata?.weight ?? 1,
        metadata: obj.metadata ?? {}
    }
}