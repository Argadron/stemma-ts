import type { Position, Quad } from "@types"
import { convertEntitiesToPositionsArrays } from "@utils"
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
 * Check Position A === Position B
 * @param positionA - Position A
 * @param positionB - Position B
 * @returns {boolean} - True if positions equals, else false
 */
export function checkTwoPositions(positionA: Position, positionB: Position): boolean {
    const [xA, yA] = positionA
    const [xB, yB] = positionB

    return (xA === xB && yA === yB)
}

/**
 * Check quad A is in quad B
 * @param quadA - Quad to check
 * @param quadB - Quad to register x, y, x2, y2
 * @returns {boolean} - True is quad A in quad B
 */
export function checkTwoQuads(quadA: Quad, quadB: Quad): boolean {
    const [x1, y1, x2, y2] = quadA
    const [bx1, by1, bx2, by2] = quadB

    return (x1 >= bx1 && y1 >= by1 && x2 <= bx2 && y2 <= by2)
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

/**
 * Get Position beetwen two targets
 * @param targetA - First target
 * @param targetB - Second target
 * @param {'LAST' | 'FIRST'} from - Flag to calc Position from target
 * @returns {Position} - Position beetwen two targets
 */
export function calcPositionBeetwenTwoentities(targetA: Entity, targetB: Entity, from: 'LAST' | 'FIRST'='LAST'): Position {
    const [aC, bC] = convertEntitiesToPositionsArrays([targetA, targetB])
    const [xA, yA] = aC!
    const [xB, yB] = bC!

    let result: Position;

    if (from === 'LAST') result = [xB-xA, yB-yA]
    else result = [xA-xB, yA-yB]

    return result
}

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
