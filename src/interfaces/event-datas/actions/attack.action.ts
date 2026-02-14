import type { Entity } from "@world";

export interface IAttackResult {
    readonly deathsCount: number;
    readonly attacker: Entity;
    readonly victims: Entity[]
}