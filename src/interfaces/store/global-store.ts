import type { Game } from "@core";
import type { CommandContext } from "@types";

export interface IGlobalStore {
    /**
     * Set value in global game store
     * @param key - Key to save
     * @param value - Any value to save
     * @returns { T } - Any saved value
     */
    readonly set: <T>(key: string, value: T) => T;

    /**
     * Get value by key
     * @param key - To get data
     * @returns { T | undefined } - Data if founded, else undefined
     */
    readonly get: <T>(key: string) => T | undefined;

    /**
     * Get all global state key-value
     * @returns { CommandContext } - Key-value state
     */
    readonly getAll: () => CommandContext;

    /**
     * Delete value in global store
     * @param key - Key to delete
     * @param emit - If true, will be emitted globalStateChanged event
     * @returns { boolean } - True if success delete, else false
     */
    readonly delete: (key: string, emit?: boolean) => boolean;
}

export interface IGlobalStoreOptions {
    /**
     * Object with key=value init data
     */
    readonly initialValue?: CommandContext;

    /**
     * Game reference
     */
    readonly game: Game;
}