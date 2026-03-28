import type { NetworkCallback, NetworkClientCallback } from "@types";

export interface IServer {
    /**
     * Emit method to all clients
     * @param event - Name of event to emit
     * @param data - Any data
     */
    readonly emit: NetworkCallback;

    /**
     * Global server listener method
     * @param event - Name of event
     * @param cb - Callback with info of client and provided data
     */
    readonly on: NetworkClientCallback;
}

export interface IClient {
    /**
     * ID of current client
     */
    readonly id: number | string;

    /**
     * Emit event to one client
     */
    readonly emit: NetworkCallback;

    /**
     * Apply listener to this current client
     */
    readonly on: NetworkClientCallback;
}