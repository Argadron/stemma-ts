import type { Position, Quad } from "@types"

/**
 * Create a Quad from Position
 * @param position - Position to create xXrXyXr Quad
 * @param radius - A radius of Quad (by default, 1)
 * @returns {Quad} - Quad from Position
 */
export function createQuadFromPosition(position: Position, radius=1): Quad {
    const [x, y] = position

    return [x-1*radius, y-1*radius, x+1*radius, y+1*radius]
}
