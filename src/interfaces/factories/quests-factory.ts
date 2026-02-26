import type { GameEvent } from "@enums";
import type { Entity } from "@world";
import type { IBaseFactoriesOptions, IEventInfo, IGameOptions } from "@interfaces";

export interface IQuestFactory {
    /**
     * Create new quest (blueprint)
     * @param quest - Quest options
     * @returns { IGameQuest } - Created quest
     */
    readonly create: (quest: IQuest) => IGameQuest;

    /**
     * Get quest by id
     * @param id - ID of quest
     * @returns { IGameQuest | undefined } - IGameQuest if founded, else undefined
     */
    readonly get: (id: number) => IGameQuest | undefined;

    /**
     * Activate quest for entity
     * @param id - ID of quest
     * @param entityId - ID of entity
     * @returns { boolean } - True if success activated, else false
     */
    readonly activate: (id: number, entityId: number) => boolean;
}

export interface IQuest {
    /**
     * Quest name
     */
    readonly name: string;

    /**
     * Events, injects to pass to onEvent
     */
    readonly injectEvents: (keyof typeof GameEvent)[];

    /**
     * Check function, must be return true when quest completed
     * @param cb - Callback, includes event data. Must be return true if quest completed
     * @returns { void }
     */
    readonly onEvent: <T>(options: IGameOptions, event: keyof typeof GameEvent, data: IEventInfo<T>, self: IGameQuest) => boolean;

    /**
     * What will do when quest completed
     * @param entity - Entity reference
     * @returns { void }
     */
    readonly onComplete: (entity: Entity) => void;

    /**
     * Any metadata for save quest variables
     */
    readonly metadata?: any;
}

export interface IGameQuest extends IQuest {
    /**
     * ID of quest
     */
    readonly id: number;
}

export interface IQuestFactoryOptions extends IBaseFactoriesOptions {}