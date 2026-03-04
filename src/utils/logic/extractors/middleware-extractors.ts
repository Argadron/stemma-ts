import type { Game } from "@"
import type { ICommand } from "@interfaces"
import type { Entity, GameObject } from "@world"

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
