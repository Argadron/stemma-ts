import type { Position, Quad } from "@types"

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
 * Checks quadA overlapping quadB
 * @param quadA - A quad to check
 * @param quadB - B quad to check
 * @returns { boolean } - True if overlapping, else false
 */
export function checkQuadsOverlapping(quadA: Quad, quadB: Quad): boolean {
    return (quadA[0] < quadB[2] && quadA[2] > quadB[0] && quadA[1] < quadB[3] && quadA[3] > quadB[1])
}