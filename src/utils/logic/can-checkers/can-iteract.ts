import type { Position } from "@types";
import { checkTwoQuads, createQuadFromPosition } from "@utils";
import type { Entity } from "@world";

/**
 * Checks a given entity can iteract wtih given position
 * @param entity - Entity to check
 * @param iteractPosition - Position to check
 * @returns { boolean } - True if entity can iteract with given position
 */
export function canIteract(entity: Entity, iteractPosition: Position): boolean {
    return checkTwoQuads(createQuadFromPosition(iteractPosition), createQuadFromPosition(entity.position, 2))
}