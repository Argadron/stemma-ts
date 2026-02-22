export enum GameObjectEnum {
    WALL = 'WALL',
    BLOCK = 'BLOCK',
    TOWER = 'TOWER',
    ITEM = 'ITEM',
    CHEST = 'CHEST'
}

export enum GameEvent {
    attack = 'attack',
    entityDead = 'entity_dead',
    entityMoved = 'entity_moved',
    entityMovedCollision = 'entity_moved_collision',
    entityMovedOutOfRange = 'entity_moved_out_of_range',
    entityCreatedCollision = 'entity_created_collision',
    objectCreatedCollision = 'object_created_collision',
    itemCreatedError = 'item_created_error',
    itemPickedUp = 'item_picked_up',
    itemPickedUpError = 'item_picked_up_error',
    itemUsed = 'item_used',
    itemDroppingError = 'item_dropping_eror',
    itemDropping = 'item_dropping',
    towerCreatedError = 'tower_created_error',
    chestCreatedError = 'chest_created_error',
    chestOpenedError = 'chest_opened_error',
    chestOpened = 'chest_opened'
}
