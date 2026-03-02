import type { Game } from "@";
import type { IChest, IGameObject, IWorldItem, ICommand, IPlugin } from "@interfaces";
import type { Position } from "@types";
import { 
    checkTwoPositions, 
    checkTwoQuads, 
    convertGameObjectToInventoryItem, 
    createQuadFromPosition, 
    gameObjectIsChest, 
    gameObjectIsItem 
} from "@utils";
import type { Entity, GameMap, GameObject } from "@world";
import { GameObjectEnum } from "@enums";

/**
 * Generate random ID
 * @returns {number} - A random id
 */
export function createId(): number {
    return Math.floor((Math.random() * 10000) + Date.now())
}

/**
 * Return a Item in provided Position, else undefined if not found
 * @param position - Position to search
 * @param objects - GameObject to searching in
 * @returns {IWorldItem | undefined} - Item if found, else undefined
 */
export function getItemInPosition(position: Position, objects: (IWorldItem & IGameObject)[]): IWorldItem | undefined {
    const obj = objects.find((obj) => (checkTwoPositions(position, obj.position) && gameObjectIsItem(obj)))

    return obj ? convertGameObjectToInventoryItem(obj)  : undefined
}

/**
 * Return a Chest in provided Position, else undefined if not found
 * @param position - Position to search
 * @param objects - GameObject to searching in
 * @returns { IChest | undefined } - Chest if found, else undefined
 */
export function getChestInPosition(position: Position, objects: (GameObject)[]): (GameObject & IChest) | undefined {
    const obj =  objects.find((obj) => checkTwoPositions(obj.position, position))

    if (!obj) return undefined
    else return gameObjectIsChest(obj) ? obj : undefined
}

/**
 * Checks a given entity can iteract wtih given position
 * @param entity - Entity to check
 * @param iteractPosition - Position to check
 * @returns { boolean } - True if entity can iteract with given position
 */
export function canIteract(entity: Entity, iteractPosition: Position): boolean {
    return checkTwoQuads(createQuadFromPosition(iteractPosition), createQuadFromPosition(entity.position, 2))
}

/**
 * Checks a given world object can see position
 * @param startPosition - Start position to check
 * @param newPosition - Position to check
 * @param map - GameMap reference
 * @returns { boolean } - True if can, else false
 */
export function canSee(startPosition: Position, endPosition: Position, map: GameMap): boolean {
    let x0 = Math.round(startPosition[0])
    let y0 = Math.round(startPosition[1])
    
    const x1 = Math.round(endPosition[0])
    const y1 = Math.round(endPosition[1])

    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = (x0 < x1) ? 1 : -1
    const sy = (y0 < y1) ? 1 : -1

    let err = dx - dy;

    while (true) {
        if (x0 === x1 && y0 === y1) return true
        if (x0 !== startPosition[0] || y0 !== startPosition[1]) {
            const objects = map.getAllInPosition([x0, y0], 'OBJECTS')

            const isBlocking = objects.some(obj => 
                obj.type === GameObjectEnum.WALL || obj.type === GameObjectEnum.BLOCK
            );
            if (isBlocking) return false
        }

        const e2 = 2 * err
        
        if (e2 > -dy) { err -= dy; x0 += sx }
        if (e2 < dx) { err += dx; y0 += sy }
    }
}

/**
 * Extract entity from context or middleware
 * @param command - Executing command
 * @param ctx - Middleware context
 * @param game - Game reference
 * @returns { Entity | undefined } - Entity if can extract or found, else undefined
 */
export function extractEntityFromMiddlewareContext(command: ICommand, ctx: Record<string, any>, game: Game): Entity | undefined {
    return ctx.entity ?? game.options.entites.manager.get(command.entityId!)
}

/**
 * Extract GameObject from context or middleware
 * @param command - Executing cmd
 * @param ctx - Middleware context
 * @param game - Game referemce
 * @returns { GameObject | undefined } - GameObject if can found, else undefined
 */
export function extractObjectFromMiddlewareContext(command: ICommand, ctx: Record<string, any>, game: Game): GameObject | undefined {
    return ctx.object ?? game.options.map.getObject(command.objectId!)
}

/**
 * Extract method from provided plugin
 * @param plugin - Plugin to extract
 * @param methodName - Method name
 * @returns { Function | undefined } - Metod if founded, else undefined
 */
export function extractMethodFromPlugin(plugin: IPlugin, methodName: string): Function | undefined {
    return (plugin as any)[methodName]
}