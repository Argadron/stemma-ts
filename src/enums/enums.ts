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
    gameStopped = 'game_stopped'
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
    QUESTS = 'QUESTS'
}