import type { Position, Quad } from "@types"
import { checkTwoPositions } from "@utils"
import type { Entity, GameObject } from "@world"

/**
 * Find one Target in provided Position
 * @param position - Position to find Target
 * @param entities - Targets array to searching
 * @returns {Target | undefined} - Target if founded, else undefined
 */
export function getInPosition(position: Position, objects: GameObject[]): GameObject | undefined
export function getInPosition(position: Position, entities: Entity[]): Entity | undefined
export function getInPosition(position: Position, entities: (Entity | GameObject)[]): (Entity | GameObject) | undefined {
    return entities.find((entity) => checkTwoPositions(position, entity.position))
}

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
