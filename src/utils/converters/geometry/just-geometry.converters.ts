import type { AnyPosition, GridPosition, Position } from "@types"
import { getCenter, positionIsQuad } from "@utils"

/**
 * Convert AnyPosition to Position (get center, is quad)
 * @param anyPosition - Quad or Position (unknown)
 * @returns {Position} - A concrete position
 */
export function convertAnyPositionToPosition(anyPosition: AnyPosition): Position {
    return positionIsQuad(anyPosition) ? getCenter(anyPosition) : anyPosition
}

/**
 * Convert position to Grid Position
 * @param position - Position to convert
 * @returns { GridPosition } - Converted position
 */
export function convertPositionToGridPosition(position: Position): GridPosition {
    return `${position[0]}:${position[1]}`
}

/**
 * Convert grid position to default position
 * @param grid - Grid position
 * @returns { Position } - Converted position
 */
export function convertGridPositionToPosition(grid: GridPosition): Position {
    const gridArray = grid.split(':').map(Number)

    return [gridArray[0]!, gridArray[1]!]
}