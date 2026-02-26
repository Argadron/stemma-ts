import type { Game } from "@";

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
}

export interface IGlobalStoreOptions {
    /**
     * Object with key=value init data
     */
    readonly initialValue?: Record<string, any>;

    /**
     * Game reference
     */
    readonly game: Game;
}