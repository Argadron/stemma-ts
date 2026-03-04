import type { Position } from "@types";
import { convertEntitiesToPositionsArrays } from "@utils";
import type { Entity } from "@world";

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
