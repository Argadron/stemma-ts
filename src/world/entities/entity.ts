import { GameObject, type GameMap } from "@world";
import { BASE_SEARCH_RADIUS } from "@const";
import type { 
    IAttackData, 
    IAttackResult,
    IItemPickedUpData,  
    IItemUsedData,
    ITarget, 
    IWorldItem,
    IItem,
    IChestOpenedData,
    IItemDroppedData,
    IGameEffect,
    IGameObject
} from "@interfaces";
import type { EntityManager } from "@";
import type { CreateUsableItemMetadata, Position } from "@types";
import {
    convertGameObjectToInventoryItem, 
    createId, 
    createQuadFromPosition, 
    getChestInPosition, 
    getItemInPosition, 
    useAttack 
} from "@utils";
import { GameObjectEnum } from "@enums";
import type { EffectFactory } from "@factories";

export class Entity implements ITarget {
    public position: Position;
    public health: number;
    public damage: number;
    public isDead: boolean;
    public name: string;
    public inventory: IItem[] = [];
    public readonly id = createId();
    public currentActiveItem: IItem | undefined;
    
    private readonly manager: EntityManager;
    private readonly map: GameMap;

    private effects: (IGameEffect & { remaining: number })[] = [];
    private tags = new Set<string>();

    /**
     * Drop all items in current entity position (for Internal use, dont activate if entity alive)
     * @returns {void}
     */
    public dropInventory(): void {
        const dropItems = [...this.inventory]

        dropItems.forEach((item) => this.dropItem(item as GameObject, this.position))
    }

    public constructor(target: ITarget, manager: EntityManager, map: GameMap) {
        this.damage = target.damage
        this.position = target.position
        this.health = target.health
        this.name = target.name
        this.isDead = target.isDead
        this.manager = manager
        this.map = map
    }

    /**
     * Delete one item from entity inventory
     * @param item - Item to search
     */
    private deleteItemFromInventory(item: IItem): boolean

    /**
     * Delete one item from entity inventory
     * @param id - ID of item
     */
    private deleteItemFromInventory(id: number): boolean
    private deleteItemFromInventory(itemOrId: IItem | number) {
        const currentLength = this.inventory.length

        this.inventory = this.inventory.filter((item) => item.id !== (typeof itemOrId === 'number' ? itemOrId : itemOrId.id))

        return currentLength === this.inventory.length ? false : true
    }

    /**
     * Get one item from entity inventory
     * @param item - Item to search
     */
    public getItemFromInventoryByItemOrId(item: GameObject): IWorldItem | undefined

    /**
     * Get one item from entity inventory
     * @param id - ID of item
     */
    public getItemFromInventoryByItemOrId(id: number): IWorldItem | undefined
    public getItemFromInventoryByItemOrId(itemOrId: GameObject | number) {
        return this.inventory.find((item) => item.id === (typeof itemOrId === 'number' ? itemOrId : itemOrId.id))
    }

    /**
     * Get all world objects in radius (Quad)
     * @param searchRadius - Radius to serach entities
     * @param returnType - Type of return array
     */
    public getNearEntitiesAndObjects(searchRadius: number, returnType?: 'ALL'): (Entity | GameObject)[];
    public getNearEntitiesAndObjects(searchRadius: number, returnType: 'ENTITES'): Entity[];
    public getNearEntitiesAndObjects(searchRadius: number, returnType: 'OBJECTS'): GameObject[];
    public getNearEntitiesAndObjects(searchRadius: number, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'): Entity[] | GameObject[] | (Entity | GameObject)[];
    public getNearEntitiesAndObjects(searchRadius=BASE_SEARCH_RADIUS, returnType: 'ALL' | 'ENTITES' | 'OBJECTS'='ALL') {
        const entityQuad = createQuadFromPosition(this.position, searchRadius)

        return this.map.getInQuad(entityQuad, returnType)
    }

    /**
     * Attack all targets in 1x1x1x1 quad
     * @param targets - Hard set targets to attack
     * @returns { IAttackResult } - Result of attack
     */
    public attack(targets?: Entity[]): IAttackResult {
        let entites: Entity[];
        let counter = 0;

        if (targets) entites = targets
        else entites = this.map.getInQuad(createQuadFromPosition(this.position), 'ENTITES')
        .filter((entity) => entity !== this) // возможно заменить на айди

        for (const entity of entites) {
            const totalDamage = this.fullDamage - entity.armorHealth

            const { isDead } = useAttack(this.manager.game, totalDamage, this, entity)

            if (isDead) counter++
        }

        this.manager.game.processEvent<IAttackData>('attack', {
            eventTime: this.map.game.currentTick,
            entity: this,
            eventData: {
                attacker: this,
                victims: entites
            }
        })

        return {
            victims: entites,
            attacker: this,
            deathsCount: counter
        }
    }

    /**
     * Pick Up item in position
     * @param position - Position of item 
     * @returns { IWorldItem  } - IWorldItem 
     */
    public pickUp(position: Position): IWorldItem {
        const item = getItemInPosition(position, this.map.getAllItems())!

        this.inventory.push(item)
        this.map.deleteObject(item.id)
        this.manager.game.processEvent<IItemPickedUpData>('itemPickedUp', {
            entity: this,
            eventTime: this.map.game.currentTick,
            eventData: {
                item
            }
        })
            
        return item
    }

    /**
     * Drop item to provided position
     * @param item - Item in inventory
     * @param position - Position to drop
     */
    public dropItem(item: GameObject, position: Position): void

    /**
     * Drop item to provided position
     * @param id - ID of item in inventory
     * @param position - Position to drop
     */
    public dropItem(id: number, position: Position): void
    public dropItem(itemOrId: GameObject | number, position: Position): void {
        const item = this.getItemFromInventoryByItemOrId(typeof itemOrId === 'number' ? itemOrId : itemOrId.id)!

        this.map.createObject({
            ...item,
            metadata: undefined,
            position,
            type: GameObjectEnum.ITEM
        }, item.metadata)
        this.map.game.processEvent<IItemDroppedData>('itemDropping', {
            entity: this,
            eventTime: this.map.game.currentTick,
            eventData: {
                item,
                position
            }
        })
        this.deleteItemFromInventory(item)

        if (item.id === this.currentActiveItem?.id) this.currentActiveItem = undefined
    }

    /**
     * Equip item from inventory
     * @param item - Item in inventory
     */
    public equipItem(item: GameObject): IWorldItem

    /**
     * Equip item from inventory
     * @param id - ID of item in inventory
     */
    public equipItem(id: number): IWorldItem
    public equipItem(itemOrId: GameObject | number): IWorldItem {
        const item = this.getItemFromInventoryByItemOrId(typeof itemOrId === 'number' ? itemOrId : itemOrId.id)!

        this.currentActiveItem = item

        return item
    }

    /**
     * Use (execute use() callback) current active item
     * @returns { void }
     */
    public useItem(): void {
        const item = this.currentActiveItem!
        const metadata = item.metadata as CreateUsableItemMetadata

        metadata.onUse(this)

        this.manager.game.processEvent<IItemUsedData>('itemUsed', {
            eventTime: this.map.game.currentTick,
            entity: this,
            eventData: {
                item
            }
        })

        if (metadata.isConsumable) {
            this.deleteItemFromInventory(item)
            this.currentActiveItem = undefined
        }
    }

    /**
     * Interact with provided position
     * @param position - Position to interaction
     * @param preComputedObjects - GameObjects from context, if exists
     * @returns { boolean } - True if success interact, else false
     */
    public interactPosition(position: Position, preComputedObjects?: GameObject[]): boolean {
        const objects = preComputedObjects ?? this.map.getAllInPosition(position, 'OBJECTS')

        return objects.some((object) => object.interact(this))
    }

    /**
     * Move entity to new position
     * @param position - Position to move
     * @returns { boolean | Entity } - Entity reference if correct move, else false
     */
    public move(position: Position): boolean | Entity {
        return this.map.teleport(this.id, position)
    }

    /**
     * Open chest in provided position
     * @param position - Position to open chest
     * @returns { void } 
     */
    public openChest(position: Position): void {    
        const chest = getChestInPosition(position, this.map.getAllInPosition(position, 'OBJECTS'))!

        chest.metadata?.items.forEach((item: GameObject) => {
            this.inventory.push(convertGameObjectToInventoryItem(item))
            this.map.deleteObject(item.id)
        })

        this.map.game.processEvent<IChestOpenedData>('chestOpened', {
                entity: this,
                eventTime: this.map.game.currentTick,
                eventData: {
                    chest
                }
            })
        this.map.deleteObject(chest.id)
    }

    /**
     * Apply new effect to entity. If entity already has effect, duration will be rewrited
     * @param effect - GameEffect
     * @param duration - Effect duration
     * @returns { void }
     */
    public applyEffect(effect: IGameEffect, duration: number): void {
        const existing = this.effects.find((eff) => eff.id === effect.id)

        if (existing) {
            existing.remaining = duration
        }
        else {
            this.effects.push({
                ...effect,
                remaining: duration
            })
        }
    }

    /**
     * Entity tick actions (internal use)
     */
    public tick() {
        this.effects = this.effects.filter((effect) => {
            effect.onTick(this, effect)
            effect.remaining --

            if (effect.remaining <= 0) {
                if (effect.onEnd) effect.onEnd(this, effect)

                return false
            }
            else return true
        })
    }

    /**
     * Convert this entity to DTO
     * @returns { Entity }
     */
    public toDTO(): Entity {
        return {
            id: this.id,
            health: this.health,
            damage: this.damage,
            isDead: this.isDead,
            name: this.name,
            inventory: this.inventory.map((item) => ({ ...item })),
            effects: this.effects.map((effect) => ({ ...effect })),
            tags: Array.from(this.tags),
            currentActiveItemId: this.currentActiveItem?.id,
            position: [...this.position]
        } as any
    }

    /**
     * Checks this entity has tag
     * @param tag - Tag to check
     * @returns { boolean } - True if has, else false
     */
    public hasTag(tag: string): boolean {
        return this.tags.has(tag)
    }

    /**
     * Push new tag
     * @param tag - Tag to push
     * @returns { void }
     */
    public addTag(tag: string): void {
        this.tags.add(tag)
    }

    /**
     * Remove tag from this entity
     * @param tag - Tag to remove
     * @returns { boolean } - True if success remove, else false
     */
    public removeTag(tag: string): boolean {
        return this.tags.delete(tag)
    }

    /**
     * Get full damage of this entity (calc entity damage + current item damage buff)
     */
    public get fullDamage() {
        return this.currentActiveItem ? this.damage + (this.currentActiveItem.damageBuff ?? 0) : this.damage
    }

    /**
     * Get full walkBuff of this entity (calc default walk step, and all items buffs/debuffs,
     * calc items weight (10 weight = -1 walk))
     */
    public get walkBuff() {
        return this.inventory.reduce((accum, item) => accum+(item.walkBuff ?? 0)-(item.weight ? Math.floor(item.weight / 10) : 1), 0)
    }

    /**
     * Get full armor of this entity (calc healthBuff of items in inventory)
     */
    public get armorHealth() {
        return this.inventory.reduce((accum, item) => accum+(item.healthBuff ?? 0), 0)
    }

    /**
     * Return a weight of items in inventory
     */
    public get totalWeight() {
        return this.inventory.reduce((accum, item) => accum+(item.weight ?? 1), 0)
    }

    /**
     * Load entity from snapshot
     * @param data - Entity raw data
     * @param manager - Entity manager reference
     * @param map - Game map reference
     * @returns { Entity }
     */
    public static fromSnapshot(data: any, manager: EntityManager, map: GameMap, effectFactory: EffectFactory): Entity {
        const entity = new Entity(data, manager, map)

        if (data.inventory && Array.isArray(data.inventory)) entity.inventory = data.inventory.map((i: IGameObject) => GameObject.fromSnapshot(i, manager, map)) 
        if (data.currentActiveItem) entity.currentActiveItem = entity.inventory.find((item) => item.id === data.currentActiveItemId)
        if (data.effects && Array.isArray(data.effects)) entity.effects = data.effects.map((effect: any) => ({
                ...effectFactory.get(effect.id),
                remaining: effect.remaining
            })).filter(Boolean)
        if (data.tags && Array.isArray(data.tags)) entity.tags = new Set(data.tags)

        manager.addToGrid(entity)

        return entity
    }
}