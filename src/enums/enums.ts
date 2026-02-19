export enum GameObjectEnum {
    WALL = 'WALL',
    BLOCK = 'BLOCK',
    TOWER = 'TOWER',
    ITEM = 'ITEM'
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
    towerCreatedError = 'tower_created_error'
}
