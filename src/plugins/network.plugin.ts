import { type Game } from "@core";
import type { IPlugin, IServer } from "@interfaces";
import type { Default, NetworkCallback } from "@types";
import type { CommandType } from "@enums";

export interface INetworkPluginBase {
    get networkServer(): IServer;
}
export type NetworkType = 'SERVER' | 'CLIENT';
export interface INetworkClient {
    /**
     * Ping the server, return pong on success
     */ 
    readonly ping: () => Promise<'PONG'>;
}
export interface INetworkServer { 
    readonly broadcast: (cmd: string, data: Default<any>) => void;
}
export type ReleasedNetwork<Type extends NetworkType> = Type extends 'SERVER' 
    ? INetworkServer 
    : INetworkClient;

/**
 * Plugin allow multiplaying in your game
 */
export const NetworkPlugin = class NetworkPlugin implements IPlugin {
    public readonly name = NetworkPlugin.name

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

    public ping(): Promise<'PONG'> {
        return new Promise(resolve => {
            this.networkServer.on('pong', () => resolve('PONG'))
            this.networkServer.emit('ping', '')
        })
    }

    public broadcast(cmd: string, data: Default<any>) {
        if (this.listeners) this.listeners.forEach(l => l(cmd, data))
    }
} as unknown as {
    new <Type extends NetworkType>(
        server: IServer,
        listeners?: Map<CommandType, NetworkCallback>
    ): INetworkPluginBase & ReleasedNetwork<Type>
}