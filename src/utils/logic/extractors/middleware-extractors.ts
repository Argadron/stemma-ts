import type { Game } from "@"
import type { ICommand } from "@interfaces"
import type { Entity, GameObject } from "@world"
import type { CommandContext } from "@types";

/**
 * Extract entity from context or middleware
 * @param command - Executing command
 * @param ctx - Middleware context
 * @param game - Game reference
 * @returns { Entity | undefined } - Entity if can extract or found, else undefined
 */
export function extractEntityFromMiddlewareContext(command: ICommand, ctx: CommandContext, game: Game): Entity | undefined {
    return ctx.entity ?? game.options.manager.get(command.entityId!)
}

/**
 * Extract GameObject from context or middleware
 * @param command - Executing cmd
 * @param ctx - Middleware context
 * @param game - Game referemce
 * @returns { GameObject | undefined } - GameObject if can found, else undefined
 */
export function extractObjectFromMiddlewareContext(command: ICommand, ctx: CommandContext, game: Game): GameObject | undefined {
    return ctx.object ?? game.options.map.getObject(command.objectId!)
}
