import type { Entity } from "@world";
import type { IAttackResult } from "@interfaces";

export const emptyAttackResult: (attacker: Entity) => IAttackResult = (attacker: Entity) => ({
    deathsCount: 0,
    victims: [],
    attacker
})

export const DEFAULT_WALK_STEP = 2
export const BASE_SEARCH_RADIUS = 3
export const BASE_FPS = 10
export const BASE_MAX_WEIGHT_LIMIT_ON_POSITION = 100

export const ITERACTION_ERRORS = {
    OUT_OF_REACH: "OUT OF REACH",
    NOT_FOUND: "NOT FOUND",
    ITEM_MAILFORMED: "ITEM MAILFORMED",
    COLLISION: "COLLISION"
} as const