import type { Position } from "@types";
import type { IBaseFactoriesOptions } from "@interfaces";

export interface ISoundsFactory {
    /**
     * Create a new sound
     * @param sound - Sound data
     * @returns { IGameSound } - Created sound
     */
    readonly create: (sound: ISound) => IGameSound;

    /**
     * Get sound by ID or sound name
     * @param idOrName - ID or name
     * @returns { IGameSound | undefined } - IGameSound if founded, else undefined
     */
    get(idOrName: string): IGameSound | undefined;
    get(idOrName: number): IGameSound | undefined;
    get(idOrName: number | string): IGameSound | undefined;

    /**
     * Generate a play sound event
     * @param idOrName - ID or name of sound
     * @param position - Optional position parameter to play
     * @returns { boolean } - True if success generate sound event, else false
     */
    play(idOrName: string, position?: Position): boolean;
    play(idOrName: number, position?: Position): boolean;
    play(idOrName: number | string, position?: Position): boolean;
}

export interface ISound {
    /**
     * Sound name
     */
    readonly name: string;

    /**
     * Sound volume
     */
    readonly volume: number;

    /**
     * Sound category
     */
    readonly category: string;
}

export interface IGameSound extends ISound {
    /**
     * ID of sound
     */
    readonly id: number;
}

export interface ISoundsFactoryOptions extends IBaseFactoriesOptions {}