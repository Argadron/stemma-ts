import type { IWorldItem } from "@interfaces";
import type { GameObject } from "@world";

/**
 * Convert GameObject to Inventory Item
 * @param obj - Object to convert
 * @returns { IWorldItem } - Inventory Item
 */
export function convertGameObjectToInventoryItem(obj: IWorldItem | GameObject): IWorldItem {
    return {
        id: obj.id,
        name: obj.name,
        position: obj.position,
        damageBuff: obj.metadata?.damageBuff ?? 0,
        healthBuff: obj.metadata?.healthBuff ?? 0,
        walkBuff: obj.metadata?.walkBuff ?? 0,
        weight: obj.metadata?.weight ?? 1,
        metadata: obj.metadata ?? {}
    }
}
