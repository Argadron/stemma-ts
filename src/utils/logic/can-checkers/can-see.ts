import { GameObjectEnum } from "@enums"
import type { IGameMap } from "@interfaces"
import type { Position } from "@types"

/**
 * Checks a given world object can see position
 * @param startPosition - Start position to check
 * @param newPosition - Position to check
 * @param map - GameMap reference
 * @returns { boolean } - True if can, else false
 */
export function canSee(startPosition: Position, endPosition: Position, map: IGameMap): boolean {
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