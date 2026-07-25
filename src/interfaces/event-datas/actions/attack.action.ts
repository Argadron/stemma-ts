import type { Entity, GameObject } from "@world";
import type { EntityManager } from "@core"
import type { GeometryTypes, Position, Position3D } from "@types";

export interface IAttackResult<G extends GeometryTypes='2D' | '3D', P extends Position | Position3D=Position | Position3D> {
    /**
     * Count of deaths after attack
     */
    readonly deathsCount: number;

    /**
     * Who attack. If EntityManager, than using .kill()
     */
    readonly attacker: Entity | GameObject | EntityManager<G, P>;

    /**
     * Array of victims
     */
    readonly victims: Entity[]
}