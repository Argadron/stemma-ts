import type { IGameIteraction, IIteraction, IIteractionsFactory, IIteractionsFactoryOptions } from "@interfaces";
import { createId } from "@utils";

export class IteractionsFactory implements IIteractionsFactory {
    private readonly iteractions = new Map<number, IGameIteraction>()
    private readonly options: IIteractionsFactoryOptions

    public constructor(options: IIteractionsFactoryOptions) {
        this.options = options
    }

    public create(iteraction: IIteraction) {
        const createdIteraction = {
            id: createId(),
            ...iteraction
        }

        this.iteractions.set(createdIteraction.id, createdIteraction)

        return createdIteraction
    }

    public get(id: number) {
        return this.iteractions.get(id)
    }
}