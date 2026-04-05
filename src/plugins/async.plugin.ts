import type { Game } from "@";
import type { IPlugin, ICommand } from "@interfaces";
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

    private currentAsync: ICommand<any> | undefined;
    private currentCommandId: number | undefined;
    private resolver: ((v: true) => void) | undefined;

    @InjectCore()
    private readonly core!: Game;
    private readonly cmdMaxWaitingDelay: number;

    /**
     * @param maxDelay - Max waiting time for cmd executing in ms
     */
    public constructor(maxDelay=CMD_MAX_WAITING_DEFAULT_DELAY) {
        this.cmdMaxWaitingDelay = maxDelay
    }

    public install() {
        return true
    }

    public async asyncExecute<T = any>(cmd: ICommand<T>): Promise<boolean> {
        this.currentAsync = cmd;
        this.currentCommandId = createId();

        (cmd.data as any).__ = { id: this.currentCommandId }

        return new Promise((resolve, reject) => {
            this.resolver = resolve
            this.core.dispatch(cmd)

            setTimeout(() => reject(false), this.cmdMaxWaitingDelay)
        })
    }

    public afterCommandExecuted<T = any>(game: Game, command: ICommand<T>) {
        if (this.currentCommandId && this.currentAsync && command.type === this.currentAsync.type && (command.data as any).__?.id === this.currentCommandId && this.resolver) {
            this.resolver(true)

            this.resolver = undefined
            this.currentAsync = undefined
            this.currentCommandId = undefined
        }
    }
}