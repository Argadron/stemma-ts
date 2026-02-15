import type { Entity, Object } from "@world";

export interface IAttackResult {
    readonly deathsCount: number;
    readonly attacker: Entity | Object;
    readonly victims: Entity[]
}