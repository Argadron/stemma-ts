import type { AnyPosition, GeometryTypes, GridPosition, GridPosition3D, Position, Position3D, Quad } from "@types"

/**
 * Check AnyPosition is Quad
 * @param position - AnyPosition to check is Quad
 * @returns {boolean} True if position is Quad, else false
 */
export function positionIsQuad(position: AnyPosition): position is Quad {
    const [x, y, maxX, maxY] = position

    if (maxX === undefined || maxY === undefined) return false
    else {
        if (!isNaN(Number(x)) && !isNaN(Number(y)) && 
        !isNaN(Number(maxX)) && !isNaN(Number(maxY))) return true
        else return false
    }
}

/**
 * Check AnyPosition is Position
 * @param position - AnyPosition to check is Position
 * @param type - Type of position (2D or 3D)
 * @returns { boolean } - True if position is Position, else false
 */
export function positionIsPosition(position: AnyPosition, type?:'2D'): position is Position
export function positionIsPosition(position: AnyPosition, type: '3D'): position is Position3D
export function positionIsPosition(position: AnyPosition, type:GeometryTypes='2D'): position is Position | Position3D {
    const [x, y] = position

    if (x === undefined || y === undefined) return false
    else return (!isNaN(x) && !isNaN(y) && position.length === (type === '2D' ? 2 : 3)) ? true : false
}

/**
 * Checks given position is GridPosition
 * @param position - Position to check
 * @param type - Type (2d or 3d)
 * @returns { boolean } - True if provided position is GridPosition, else false
 */
export function positionIsGridPosition(position: Position | GridPosition | GridPosition3D, type:GeometryTypes='2D'): position is GridPosition {
    return typeof position === "string" && position.split(":").length === (type === '2D' ? 2 : 3)
}