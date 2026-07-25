import type { Position, Position3D, Quad } from "@types"
import { positionIsPosition } from "@utils"

/**
 * Create a Quad from Position
 * @param position - Position to create xXrXyXr Quad
 * @param radius - A radius of Quad (by default, 1)
 * @returns {Quad} - Quad from Position
 */
export function createQuadFromPosition(position: Position | Position3D, radius=1): Quad {
    const [x, y] = positionIsPosition(position, '2D') ? [position[0], position[1]] : [position[0], position[2]]

    return [x-1*radius, y-1*radius, x+1*radius, y+1*radius]
}
