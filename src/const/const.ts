import type { Entity } from "@world";
import type { IAttackResult } from "@interfaces";

/**
 * Generates empty attack result message
 * @param attacker - Who will attack
 * @returns { IAttackResult }
 */
export const emptyAttackResult = (attacker: Entity): IAttackResult => ({
    deathsCount: 0,
    victims: [],
    attacker
})

/**
 * Base walk step (.move())
 */
export const DEFAULT_WALK_STEP = 2

/**
 * Base radius for search world objects near entity
 */
export const BASE_SEARCH_RADIUS = 3

/**
 * Base FPS to start game
 */
export const BASE_FPS = 10

/**
 * Max weight limit on one block (items, chest)
 */
export const BASE_MAX_WEIGHT_LIMIT_ON_POSITION = 100

/**
 * Base radius for hear
 */
export const BASE_HEARING_RADIUS = 3

/**
 * Object with all iteraction errors
 */
export const ITERACTION_ERRORS = {
    OUT_OF_REACH: "OUT OF REACH",
    NOT_FOUND: "NOT FOUND",
    ITEM_MAILFORMED: "ITEM MAILFORMED",
    COLLISION: "COLLISION"
} as const