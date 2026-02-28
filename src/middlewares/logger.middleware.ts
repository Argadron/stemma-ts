import type { MiddlewareFn } from "@types"

/**
 * Built-in logger middleware
 */
export const loggerMiddleware: MiddlewareFn = (command, next) => {
    console.log(`[LOG] [TICK:${command.tick}] [TYPE:${command.type}] ${command.entityId ? `[ENTITY:${command.entityId}]` : `[SYSTEM COMMAND]`}`)

    return next()
} 
export default loggerMiddleware