import type { Game } from "@core";
import type { IPlugin, IServer } from "@interfaces";
import type { NetworkCallback } from "@types";
import type { CommandType } from "@enums";

/**
 * Plugin allow multiplaying in your game
 */
export class NetworkPlguin implements IPlugin {
    public readonly name = NetworkPlguin.name

    private readonly server: IServer;
    private readonly listeners: Map<CommandType, NetworkCallback> | undefined

    /**
     * Server can be provided from 'ws', 'socket.io', etc.
     * @param server - Server reference
     * @param listeners - Map of listeners
     */
    public constructor(
        server: IServer,
        listeners?: Map<CommandType, NetworkCallback>
    ) {
        this.server = server
        this.listeners = listeners || undefined
    }

    public install(game: Game) {
        game.use((cmd, next) => {
            if (!cmd.isNetwork) this.server.emit(cmd.type, cmd.data)

            next()
        })

        this.listeners?.forEach((cb, event) => {
            this.server.on(event, (client, data) => {
                game.dispatch({
                    tick: game.currentTick,
                    type: event,
                    entityId: +client.id,
                    data,
                    isNetwork: true
                })

                cb(event, data)
            })
        })

        return true
    }

    public get networkServer() {
        return this.server
    }
}