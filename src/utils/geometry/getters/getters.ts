import type { Position, Quad } from "@types"

/**
 * Get a central position of Quad
 * @param quad - Quad to get center Position
 * @returns {Position} - Central position
 */
export function getCenter(quad: Quad): Position {
    const [x1, y1, x2, y2] = quad
    
    const centerX = (x1 + x2) / 2
    const centerY = (y1 + y2) / 2
    
    return [centerX, centerY]
}
