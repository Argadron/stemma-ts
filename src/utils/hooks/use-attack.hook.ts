import type { Game } from "@";
import type { Entity, Object } from "@world";
import type { IDeadData } from "@interfaces";

/**
 * Calc attack, emit DeadEvent, return victim dead state
 * @param game - Game reference to emit event
 * @param dmg - Total damage (full calculated)
 * @param attacker - Attacker reference (another Entity, tower, etc.)
 * @param victim - Victim reference
 * @returns { { isDead: boolean } } - Object with dead info
 */
export function useAttack(game: Game, dmg: number, attacker: Entity | Object, victim: Entity): { isDead: boolean; } {
    victim.health = victim.health - (dmg >= 0 ? dmg : 0)
    
    if (victim.health <= 0) {
        victim.isDead = true
    
        game.processEvent<IDeadData>('entityDead', {
            eventTime: new Date(),
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