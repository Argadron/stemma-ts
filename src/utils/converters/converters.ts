import type { AnyPosition, Position } from "@types"
import { getCenter, positionIsQuad } from "@utils"
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

/**
 * Convert AnyPosition to Position (get center, is quad)
 * @param anyPosition - Quad or Position (unknown)
 * @returns {Position} - A concrete position
 */
export function convertAnyPositionToPosition(anyPosition: AnyPosition): Position {
    return positionIsQuad(anyPosition) ? getCenter(anyPosition) : anyPosition
}
