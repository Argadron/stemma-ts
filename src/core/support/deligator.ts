import type { ICommand, IDeligator, IDeligatorOptions, ISnapshot } from "@interfaces";
import { Game } from "@core"
import type { GeometryToPosition, GeometryTypes } from "@types";

/**
 * Deligator allows you to execute commands in source engine for perfomance boost
 */
export class Deligator<G extends GeometryTypes='2D'|'3D'> implements IDeligator {
    private readonly options: IDeligatorOptions<G>;
    
    private game!: Game<G>;
    private isSourceInited = false

    private async activateSource() {
        try {
            const source = await fetch(this.options.source as URL, {
                headers: {
                    "Content-Type":"Application/Json"
                }
            })
            const snapshot = await source.json() as ISnapshot<GeometryToPosition<G>>

            this.game = Game.fromSnapshot<G>(snapshot)
            this.onFullLoad()
            this.isSourceInited = true
        } catch {
            throw new Error('[Deligator]: Cant fetch source')
        }
    }

    private onFullLoad() {
        if (!this.game.options.commandBusOptions?.usingCommangQueue) return;

        this.game.use((cmd, next, game) => {
            if (game.commandQueueLength < this.options.triggerOn) return next()
            else return this.deligate(cmd)
        })
    }

    public constructor(options: IDeligatorOptions<G>) {
        this.options = options
        
        if (!(this.options.source instanceof URL)) {
            this.game = this.options.source
            this.isSourceInited = true
            this.onFullLoad()
        }
        else this.activateSource()
    }

    /**
     * Deligate cmd to source engine
     * @param cmd - Cmd to deligate
     * @returns { void }
     */
    public deligate(cmd: ICommand): void {
        if (!this.isSourceInited) return;

        this.game.dispatch(cmd)
    }
}