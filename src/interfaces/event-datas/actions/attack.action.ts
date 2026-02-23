import type { Entity, GameObject } from "@world";
import type { EntityManager } from "@"

export interface IAttackResult {
    /**
     * Count of deaths after attack
     */
    readonly deathsCount: number;

    /**
     * Who attack. If EntityManager, than using .kill()
     */
    readonly attacker: Entity | GameObject | EntityManager;

    /**
     * Array of victims
     */
    readonly victims: Entity[]
}