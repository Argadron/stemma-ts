import type { Game } from "@core";
import { NetworkPlguin } from "@plugins";
import type { ServerCallback } from "@types";

/**
 * This hook allows you to executing lightweight server-side cmds
 * Your server must listen 'serverCommand' event
 * @param cb - Callback with server code
 * @param core - Game reference (if hydration disabled)
 * @returns { void }
 */
export function useServer(cb: ServerCallback, core?: Game): void {
    const game = useServer.prototype.game as Game || core

    const network = game.getPlugin(NetworkPlguin.name)

    if (!network) throw new Error(`[useServer]: Network plugin doesnt enabled`)
    else {
        const server = (network as NetworkPlguin).networkServer
        const signature = `${Math.random() * 1000}_${Date.now()}_${game.currentTick}`

        server.emit('nextSignature', signature)
        server.emit('serverCommand', cb(signature))
    }
}
