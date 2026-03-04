import type { IAttackResult } from "@interfaces";
import type { Entity } from "@world";

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