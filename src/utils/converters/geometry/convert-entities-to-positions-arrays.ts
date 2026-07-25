import type { Position, Position3D } from "@types"
import type { Entity } from "@world"

/**
 * Convert array of Targets to Positions format [[x, y], [x,y]]...
 * @param entities - Targets to convert
 * @returns {Position[] | Position3D[]} - Converted positions
 */
export function convertEntitiesToPositionsArrays(entities: Entity[]):( Position | Position3D)[] {
    const result = []

    for (const entity of entities) {
        result.push(entity.position)
    }

    return result
}
