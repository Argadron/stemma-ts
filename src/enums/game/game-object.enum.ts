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