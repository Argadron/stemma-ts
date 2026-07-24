import type { Entity } from "@world";
import { useLink } from '@utils';
import type { ILink, ILinkOptions } from "@interfaces";

/**
 * Create array of Links from attack
 * @param attacker - Attacker, who make Attack
 * @param options - Uselink options
 * @returns { ILink[] }
 */
export function createLinksFromAttack(attacker: Entity, options?: ILinkOptions): ILink[] {
    const attack = attacker.attack()

    return attack.victims.map(victim => useLink(attacker, victim, options))
} 