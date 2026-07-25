/**
 * Position type. Base 2D position
 */
export type Position = [number, number]

/**
 * 3D Position type
 */
export type Position3D = [number, number, number]

/**
 * Quad type. (x1y1x2y2)
 */
export type Quad = [number, number, number, number]

/**
 * AnyPosition type. Can be position, or quad (unknown)
 */
export type AnyPosition = Position | Position3D | Quad

/**
 * Grid position type
 */
export type GridPosition = `${number}:${number}`

/**
 * Grid 3D position type
 */
export type GridPosition3D = `${number}:${number}:${number}`

/**
 * Types of geometry
 */
export type GeometryTypes = '2D' | '3D'

/**
 * Help type to get pos type by geomety type
 */
export type GeometryToPosition<G extends GeometryTypes> = G extends '3D' ? Position3D : Position;
