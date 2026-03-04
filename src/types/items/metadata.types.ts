import type { GameObjectEnum } from "@enums";
import type { IItem, IWorldItem } from "@interfaces";
import type { Entity, GameObject } from "@world";

/**
 * Metadata for create Item object type
 */
export type CreateItemMetadata = Pick<IItem, 'damageBuff' | 'healthBuff' | 'walkBuff' | 'weight'>

/**
 * Metadata for create usable item object type
 */
export type CreateUsableItemMetadata = CreateItemMetadata & { 
    /**
     * Callback with actions with entity, etc... 
     * Item WILL BE DELETED AUTOMATIC after executing callback
     * @param e - Entity context
     * @returns { void } - Any actions on item using...
     * @example
     * onUse(e) => {
     *   e.damage += 1
     *   e.healht -= 1
     * }
     */
    readonly onUse: (e: Entity) => void,
    readonly isConsumable?: boolean;
}

/**
 * Metadata for create Tower object type
 */
export type CreateTowerMetadata = { damage: number }

/**
 * Metadata for create Chest object type
 */
export type CreateChestMetadata = { items: (IWorldItem | number)[] }

/**
 * Metadata for create Trigger object type.
 * isSensor - send triggerSensorActive event in next game tick
 * scanInterval - optional parameter for sensors (interval for checks in ticks)
 */
export type CreateTriggerMetadata = { trigger: (e: Entity, o: GameObject) => void, real: GameObjectEnum.BLOCK | GameObjectEnum.WALL, isSensor?: boolean; scanInterval?: number } 