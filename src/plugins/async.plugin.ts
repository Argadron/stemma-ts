import type { Game } from "@";
import type { IPlugin, ICommand, IAsyncMapValues, ICommandBlocked } from "@interfaces";
import { createId } from "@utils";
import { InjectCore } from "@decorators";
import { CMD_MAX_WAITING_DEFAULT_DELAY } from "@const";

/**
 * Plugin enable async/await in commands by execute all commands with asyncExecute wrapping
 * @example
 * const asyncPlugin = new AsyncPlugin()
 * 
 * game.registerPlugin(asyncPlugin)
 * 
 * async function foo() {
 *      await asyncPlugin.asyncExecute({
 *          ...// game.dispatch() object args
 *      })
 * }
 * 
 * foo()
 */
export class AsyncPlugin implements IPlugin {
    public readonly name = AsyncPlugin.name;

    @InjectCore()
    private readonly core!: Game;
    private readonly cmdMaxWaitingDelay: number;
    private readonly asyncMap = new Map<number, IAsyncMapValues>();

    /**
     * @param maxDelay - Max waiting time for cmd executing in ms
     */
    public constructor(maxDelay=CMD_MAX_WAITING_DEFAULT_DELAY) {
        this.cmdMaxWaitingDelay = maxDelay
    }

    public install() {
        return true
    }

    public async asyncExecute<T = any>(command: ICommand<T>): Promise<boolean> {
        const commandId = createId();

        (command.data as any).__ = { id: commandId }

        return new Promise((resolver) => {
            const unSub = this.core.on<ICommandBlocked>('commandCanceled', (options, event, data) => {
                if ((data.eventData.command.data as any).__?.id === commandId) {
                    this.asyncMap.delete(commandId)

                    resolver(false)
                }
            })

            this.asyncMap.set(commandId, { resolver, unSub })
            this.core.dispatch(command)

            setTimeout(() => {
                this.asyncMap.delete(commandId)

                unSub()

                resolver(false)
            }, this.cmdMaxWaitingDelay)
        })
    }

    /**
     * Cancel all async commands
     */
    public cancelAll() {
        this.asyncMap.forEach(v => v.unSub())
        this.asyncMap.clear()
    }

    public afterCommandExecuted<T = any>(game: Game, command: ICommand<T>) {
        const id = (command.data as any).__?.id
        const asyncInfo = this.asyncMap.get(id)

        if (asyncInfo) {
            asyncInfo.resolver(true)
            asyncInfo.unSub()

            this.asyncMap.delete(id)
        }
    }
}