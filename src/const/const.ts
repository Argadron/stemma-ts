import type { Entity } from "@world";
import type { IAttackResult } from "@interfaces";

export const emptyAttackResult: (attacker: Entity) => IAttackResult = (attacker: Entity) => ({
    deathsCount: 0,
    victims: [],
    attacker
})
export const DEFAULT_WALK_STEP = 2