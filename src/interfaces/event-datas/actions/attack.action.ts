import type { Entity, GameObject } from "@world";

export interface IAttackResult {
    readonly deathsCount: number;
    readonly attacker: Entity | GameObject;
    readonly victims: Entity[]
}