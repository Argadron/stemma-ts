import type { Position } from "@types"
import type { Entity } from "@world"

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
