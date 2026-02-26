import type { IGameQuest, IQuest, IQuestFactory, IQuestFactoryOptions } from "@interfaces";
import { createId } from "@utils";

export class QuestsFactory implements IQuestFactory {
    private readonly quests = new Map<number, IGameQuest>()
    private readonly options: IQuestFactoryOptions;

    public constructor(options: IQuestFactoryOptions) {
        this.options = options
    }

    public create(quest: IQuest) {
        const id = createId()

        const createdQuest = {
            id,
            ...quest
        }

        this.quests.set(id, createdQuest)

        return createdQuest
    }

    public get(id: number) {
        return this.quests.get(id)
    }

    public activate(id: number, entityId: number) {
        const bluepointQuest = this.get(id)

        if (!bluepointQuest) return false

        const entity = this.options.game.options.entites.manager.get(entityId)

        const quest = {
            ...bluepointQuest,
            metadata: structuredClone(bluepointQuest.metadata)
        }
        const unSubscribers: VoidFunction[] = []

        if (!entity) return false
        else {
            if (quest.injectEvents.length === 0) return false
            else {
                for (const event of quest.injectEvents) {
                    const sub = this.options.game.on(event, (o, e, d) => {
                        const cbRes = quest.onEvent(o, e, d, quest)

                        if (cbRes === true) {
                            quest.onComplete(entity)

                            unSubscribers.forEach((s) => s())
                        }
                    })

                    unSubscribers.push(sub)
                }

                return true
            }
        }
    }
}