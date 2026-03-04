import type { AnyPosition, Position, Quad } from "@types"

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
 * @returns { boolean } - True if position is Position, else false
 */
export function positionIsPosition(position: AnyPosition): position is Position {
    const [x, y] = position

    if (x === undefined || y === undefined) return false
    else return (!isNaN(x) && !isNaN(y) && position.length === 2) ? true : false
}