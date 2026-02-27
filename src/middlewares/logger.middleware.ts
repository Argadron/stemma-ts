import type { MiddlewareFn } from "@types"

export const loggerMiddleware: MiddlewareFn = (command, next) => {
    console.log(`[LOG] [TICK:${command.tick}] [TYPE:${command.type}] ${command.entityId ? `[ENTITY:${command.entityId}]` : `[SYSTEM COMMAND]`}`)

    next()
} 
export default loggerMiddleware