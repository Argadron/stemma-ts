import type { Entity, GameObject } from "@world";
import type { EntityManager } from "@"

export interface IAttackResult {
    readonly deathsCount: number;
    readonly attacker: Entity | GameObject | EntityManager;
    readonly victims: Entity[]
}