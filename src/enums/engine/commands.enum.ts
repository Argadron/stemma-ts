export enum CommandType {
    /**
     * Drop entity event command
     */
    DROP_INVENTORY = 'DROP_INVENTORY',

    /**
     * Attack command
     */
    ATTACK = 'ATTACK',

    /**
     * Pickup command
     */
    PICKUP = 'PICKUP',

    /**
     * Drop item command
     */
    DROP_ITEM = 'DROP_ITEM',

    /**
     * Equip item command
     */
    EQUIP_ITEM = 'EQUIP_ITEM',

    /**
     * Use item command
     */
    USE_ITEM = 'USE_ITEM',

    /**
     * Interact position command
     */
    INTERACT_POSITION = 'INTERACT_POSITION',

    /**
     * Move command
     */
    MOVE = 'MOVE',

    /**
     * Open chest command
     */
    OPEN_CHEST = 'OPEN_CHEST',

    /**
     * Apply effect command
     */
    APPLY_EFFECT = 'APPLY_EFFECT',

    /**
     * Tower shoot command
     */
    TOWER_SHOOT = 'TOWER_SHOOT',

    /**
     * Set global state command
     */
    SET_STATE = 'SET_STATE',

    /**
     * Create entity command
     */
    CREATE_ENTITY = 'CREATE_ENTITY',

    /**
     * Create game object cmd
     */
    CREATE_OBJECT = 'CREATE_OBJECT',

    /**
     * Delete game object cmd
     */
    DELETE_OBJECT = 'DELETE_OBJECT',

    /**
     * Set entity tag cmd
     */
    SET_ENTITY_TAG = 'SET_ENTITY_TAG',

    /**
     * Delete entity tag cmd
     */
    DELETE_ENTITY_TAG = 'DELETE_ENTITY_TAG'
}