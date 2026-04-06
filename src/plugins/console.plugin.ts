import type { Game } from "@";
import { CONSOLE_BASE_HEIGHT, CONSOLE_BASE_WIDTH } from "@const";
import { InjectCore, OnTick } from "@decorators";
import type { IPlugin, ICanvasPluginOptions } from "@interfaces";

export class ConsolePlugin implements IPlugin {
    public readonly name = ConsolePlugin.name;

    @InjectCore()
    private readonly core!: Game;
    private readonly colors: Record<string, string> = {
        reset: "\x1b[0m",
        green: "\x1b[32m",
        red: "\x1b[31m",
        yellow: "\x1b[33m",
        cyan: "\x1b[36m",
        gray: "\x1b[90m"
    }
    private readonly width: number;
    private readonly height: number;
    private readonly assets: Record<string, string>;

    private isInBounds(x: number, y: number): boolean {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    public constructor(
        { height, width, assets }: 
        Omit<ICanvasPluginOptions, 'canvas' | 'assets'> &
        { readonly assets?: Record<string, any> }
        ={ height: CONSOLE_BASE_HEIGHT, width: CONSOLE_BASE_WIDTH, assets: {} }
    ) {
        this.width = width!
        this.height = height!
        this.assets = assets!
    }

    public install() {
        if (!(typeof process !== "undefined" && !!process.stdout)) return false
        else {
            process.stdout.write("\x1b[?25l\x1bc")

            const { stdin } = process

            stdin.setRawMode(true)
            stdin.resume()
            stdin.setEncoding('utf-8')
            stdin.on("data", (k) => {
                if (k === "\u0003") {
                    this.core.stop()

                    if (stdin.isTTY) {
                        stdin.setRawMode(false)
                        stdin.pause()
                        stdin.removeAllListeners("data")
                    }

                    process.kill(0, 'SIGINT')
                }
            }) 

            return true
        }
    }

    @OnTick({ interval: 1, type: 'after' })
    public render() {
        const grid: string[][] = Array.from({ length: this.height }, () => 
            Array(this.width).fill(`${this.colors.gray}.${this.colors.reset}`)
        )

        this.core.options.manager.entities.forEach(e => {
            const [x, y] = e.position

            if (this.isInBounds(x, y)) {
                if (grid[y]) grid[y][x] = this.assets[e.name] || `${this.colors.yellow}#${this.colors.reset}`
            }
        })
        this.core.options.map.objects.forEach(o => {
            const [x, y] = o.position

            if (this.isInBounds(x, y)) {
                if (grid[y]) grid[y][x] = this.assets[o.name] || `${this.colors.yellow}#${this.colors.reset}`
            }
        })

        process.stdout.write("\x1b[H")

        const output = grid.map(row => row.join(" ")).join("\n")
        
        process.stdout.write(
            `${this.colors.cyan} GAME ${this.colors.reset} | Tick: ${this.core.currentTick}\n` +
            output + 
            `\n\n${this.colors.gray}Press Ctrl+C to exit${this.colors.reset}\n`
        )
    }
}