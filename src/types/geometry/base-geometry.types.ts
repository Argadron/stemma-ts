/**
 * Position type. Base 2D position
 */
export type Position = [number, number]

/**
 * Quad type. (x1y1x2y2)
 */
export type Quad = [number, number, number, number]

/**
 * AnyPosition type. Can be position, or quad (unknown)
 */
export type AnyPosition = Position | Quad

/**
 * Grid position type
 */
export type GridPosition = `${number}:${number}`