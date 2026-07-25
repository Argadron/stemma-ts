import type { AnyPosition, GridPosition, GridPosition3D, Position, Position3D } from "@types"
import { getCenter, positionIsGridPosition, positionIsPosition, positionIsQuad } from "@utils"

/**
 * Convert AnyPosition to Position (get center, is quad)
 * @param anyPosition - Quad or Position (unknown)
 * @returns {Position} - A concrete position
 */
export function convertAnyPositionToPosition(anyPosition: AnyPosition): Position | Position3D {
    return positionIsQuad(anyPosition) ? getCenter(anyPosition) : anyPosition
}

/**
 * Convert position to Grid Position
 * @param position - Position to convert
 * @returns { GridPosition | GridPosition3D } - Converted position
 */
export function convertPositionToGridPosition(position: Position3D): GridPosition3D
export function convertPositionToGridPosition(position: Position): GridPosition
export function convertPositionToGridPosition(position: Position | Position3D): GridPosition | GridPosition3D
export function convertPositionToGridPosition(position: Position | Position3D): GridPosition | GridPosition3D {
    return positionIsPosition(position, '2D') ? `${position[0]}:${position[1]}` : `${position[0]}:${position[1]}:${position[2]}`
}

/**
 * Convert grid position to default position
 * @param grid - Grid position
 * @returns { Position | Position3D } - Converted position
 */
export function convertGridPositionToPosition(grid: GridPosition3D): Position3D
export function convertGridPositionToPosition(grid: GridPosition): Position
export function convertGridPositionToPosition(grid: GridPosition | GridPosition3D): Position | Position3D {
    const gridArray = grid.split(':').map(Number)
    const [x, y, z] = gridArray

    return positionIsGridPosition(grid, '2D') ? [x!, y!] : [x!, y!, z!]
}