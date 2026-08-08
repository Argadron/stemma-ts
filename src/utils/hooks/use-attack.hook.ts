import type { Game } from "@core";
import type { Entity, GameObject } from "@world";
import type { IDeadData } from "@interfaces";

/**
 * Calc attack, emit DeadEvent, return victim dead state
 * @param dmg - Total damage (full calculated)
 * @param attacker - Attacker reference (another Entity, tower, etc.)
 * @param victim - Victim reference
 * @param core - Game reference to emit event (if hydration disabled)
 * @returns { { isDead: boolean } } - GameObject with dead info
 */
export function useAttack(dmg: number, attacker: Entity | GameObject, victim: Entity, core?: Game): { isDead: boolean; } {
    if (victim.isDead) return { isDead: true }

    const game = useAttack.prototype.game as Game || core

    victim.health = victim.health - (dmg >= 0 ? dmg : 0)
    
    if (victim.health <= 0) {
        victim.isDead = true
        victim.dropInventory()
    
        game.processEvent<IDeadData>('entityDead', {
            eventTime: game.currentTick,
            entity: victim,
            eventData: {
                entity: victim,
                killer: attacker
            }
        })
    }

    return {
        isDead: victim.isDead
    }
}