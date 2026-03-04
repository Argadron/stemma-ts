export enum GameObjectEnum {
    /**
     * Just a wall.
     */
    WALL = 'WALL',

    /**
     * Just a block.
     */
    BLOCK = 'BLOCK',

    /**
     * Tower type. Can use shoot, can set damage
     */
    TOWER = 'TOWER',

    /**
     * Item type. Can be modified, pickUped, etc.
     */
    ITEM = 'ITEM',

    /**
     * Chest type. Container for Items
     */
    CHEST = 'CHEST',

    /**
     * Trigger type. Execute callback, when entity moving to him
     */
    TRIGGER = 'TRIGGER'
}

export enum GameEvent {
    /**
     * Executes, when in world one attack other
     */
    attack = 'attack',

    /**
     * Executes, when any entity created in world
     */
    entityCreated = 'entity_created',

    /**
     * Executes, when any entity deleted from world
     */
    entityDeleted = 'entity_deleted',

    /**
     * Executes, when any entity updated her tags
     */
    entityTagsChanged = 'entity_tags_changed',

    /**
     * Executes, when any entity dead
     */
    entityDead = 'entity_dead',

    /**
     * Executes, when any entity moved
     */
    entityMoved = 'entity_moved',

    /**
     * Executes, when any entity cant moved (collision)
     */
    entityMovedCollision = 'entity_moved_collision',

    /**
     * Executes, when any entity cant moved (moving out of range)
     */
    entityMovedOutOfRange = 'entity_moved_out_of_range',

    /**
     * Executes, when entity will not be created (collision)
     */
    entityCreatedCollision = 'entity_created_collision',

    /**
     * Executes, when object will not be created (collision)
     */
    objectCreatedCollision = 'object_created_collision',

    /**
     * Executes, when any gameobject has been created
     */
    objectCreated = 'object_created',

    /**
     * Executes, when any game object has been deleted
     */
    objectDeleted = 'object_deleted',

    /**
     * Executes, when item will not be created
     */
    itemCreatedError = 'item_created_error',

    /**
     * Executes, when any entity picking up any item (success)
     */
    itemPickedUp = 'item_picked_up',

    /**
     * Executes, when any entity cant pick up any item
     */
    itemPickedUpError = 'item_picked_up_error',

    /**
     * Executes, when any entity use any item
     */
    itemUsed = 'item_used',

    /**
     * Executes, when any entity drop any item
     */
    itemDroppingError = 'item_dropping_error',

    /**
     * Executes, when any entity drop any item
     */
    itemDropping = 'item_dropping',

    /**
     * Executes, when tower will not be created
     */
    towerCreatedError = 'tower_created_error',

    /**
     * Executes, when tower make a shoot
     */
    towerShooted = 'tower_shooted',

    /**
     * Executes, when chest will not be created
     */
    chestCreatedError = 'chest_created_error',

    /**
     * Executes, when any entity cant open any chest
     */
    chestOpenedError = 'chest_opened_error',

    /**
     * Executes, when any entity open chest (success)
     */
    chestOpened = 'chest_opened',

    /**
     * Executes, when trigger will not be created
     */
    triggerCreatedError = 'trigger_created_error',

    /**
     * Executes, when any entity activate any trigger
     */
    triggerActivated = 'trigger_activated',

    /**
     * Executes in every tick, when any entity stay on any trigger with active sensor
     */
    triggerSensorActive = 'trigger_sensor_active',

    /**
     * Excutes, when this world object heared noise
     */
    gameObjectHearedNoise = 'game_object_heared_noise',

    /**
     * Executes, when game started
     */
    gameStarted = 'game_started',

    /**
     * Executes, when game stopped
     */
    gameStopped = 'game_stopped',

    /**
     * Executes, when global world state changed
     */
    globalStateChanged = 'global_state_changed',

    /**
     * Executes, when code request play sound
     */
    playSound = 'play_sound'
}

export enum FactoryKeys {
    /**
     * Effects factory key
     */
    EFFECTS = 'EFFECTS',

    /**
     * Blueprints factory key
     */
    BLUEPRINTS = 'BLUEPRINTS',

    /**
     * Quests factory key
     */
    QUESTS = 'QUESTS',

    /**
     * Iteractions factory key
     */
    ITERACTIONS = 'ITERACTIONS',

    /**
     * Sounds factory key
     */
    SOUNDS = 'SOUNDS'
}

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