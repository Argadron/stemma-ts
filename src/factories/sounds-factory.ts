import type { IGameSound, IPlaySoundData, ISound, ISoundsFactory, ISoundsFactoryOptions } from "@interfaces";
import type { Position } from "@types";
import { createId } from "@utils";

export class SoundsFactory implements ISoundsFactory {
    private readonly sounds = new Map<number, IGameSound>();
    private readonly options: ISoundsFactoryOptions;

    public constructor(options: ISoundsFactoryOptions) {
        this.options = options
    }

    /**
     * Get sound by name
     * @param name - Name of sound
     * @returns { IGameSound | undefined } - IGameSound if founded, else undefined
     */
    private getByName(name: string): IGameSound | undefined {
        return this.sounds.values().find((sound) => sound.name === name)
    }

    public create(sound: ISound) {
        const createdSound = {
            id: createId(),
            ...sound
        }

        this.sounds.set(createdSound.id, createdSound)

        return createdSound
    }

    public get(idOrName: string): IGameSound | undefined;
    public get(idOrName: number): IGameSound | undefined;
    public get(idOrName: number | string): IGameSound | undefined {
        return typeof idOrName === 'number' ? this.sounds.get(idOrName) : this.getByName(idOrName)
    }

    public play(idOrName: string, position?: Position): boolean;
    public play(idOrName: number, position?: Position): boolean;
    public play(idOrName: number | string, position?: Position): boolean {
        let sound: IGameSound | undefined

        if (typeof idOrName === 'number') sound = this.get(idOrName)
        else sound = this.get(idOrName)

        if (!sound) return false
        else {
            this.options.game.processEvent<IPlaySoundData>('playSound', {
                eventTime: new Date(),
                eventData: {
                    sound,
                    position
                }
            })

            return true
        }
    }
}