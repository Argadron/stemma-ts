import type { Game } from "@core";
import { GRAPHIC_GRID_X, GRAPHIC_GRID_Y, GRAPHIC_HEIGHT, GRAPHIC_WIDTH, isServer } from "@const";
import type { IGraphicPluginOptions, IPlugin } from "@interfaces";
import { InjectCore, OnTick } from "@decorators";
import { createPluginProto, extractMethodFromPlugin } from "@utils";
import type { OnConsoleKeyboardEventDecoratorProperites } from "@types";

/**
 * Plugin enable rendering in widnow (OS)
 */
export class GraphicPlugin implements IPlugin {
    public readonly name = GraphicPlugin.name;

    @InjectCore()
    private readonly core!: Game;
    private readonly supportedPlatforms = ['linux'];
    private readonly options: IGraphicPluginOptions;

    private platform: string | undefined;
    private spawn: Function | undefined;
    private window: any | undefined;

    private async renderLinux() {
        let spawn;

        if (this.spawn) spawn = this.spawn
        else {
            const child = await import('child_process')

            spawn = child.spawn

            this.spawn = child.spawn
        }

        const grid = Array.from({ length: this.options.grid?.[0] || GRAPHIC_GRID_Y }, () => Array(this.options.grid?.[1] || GRAPHIC_GRID_X).fill('⬛'))

        this.core.options.manager.entities.forEach(e => {
            const [x, y] = e.position

            if (grid[y] && grid[y][x]) {
                if (this.options.assets && this.options.assets[e.name]) grid[y][x] = this.options.assets[e.name]
                else grid[y][x] = "@"
            }
        })
        this.core.options.map.objects.forEach(o => {
            const [x, y] = o.position

            if (grid[y] && grid[y][x]) {
                if (this.options.assets && this.options.assets[o.name]) grid[y][x] = this.options.assets[o.name]
                else grid[y][x] = "[]"
            }
        })

        const gridString = grid.map(row => row.join(' ')).join('\n')

        if (this.window) {
            this.window.kill()
            this.window = undefined
        }

        const window = spawn('zenity', [
            '--forms',
            `--title=${this.options.appName}`,
            `--text=${gridString}`,
            '--add-entry=Keyboard Key',
            `--height=${this.options.height || GRAPHIC_HEIGHT}`,
            `--width=${this.options.width || GRAPHIC_WIDTH}`,
            '--ok-label=Send'
        ])

        this.window = window
        this.core.getAllPlugins().forEach((plugin) => {
            const proto = createPluginProto(plugin)

            if (proto.graphicListeners && isServer) proto.graphicListeners.forEach((v: OnConsoleKeyboardEventDecoratorProperites) => {
                const method = extractMethodFromPlugin(plugin, v.methodName)

                if (method) window.stdout.on("data", (data: Buffer) => {
                    const key = data.toString('utf-8')[0]

                    if (key) {
                        const checkKey = key.toUpperCase()

                        if (typeof v.key === 'string' ? v.key === checkKey : v.key.test(checkKey)) method.call(plugin, key)
                    }
                })
            })
        })

        window.on('close', (code: number) => {
            if (code === 0) {
                window.stdout.removeAllListeners()
                window.removeAllListeners()

                this.renderLinux()
            }
            else if (code === 1) process.kill(0, 'SIGKILL')
        })
    }

    public renderer() {
        switch (this.platform) {
            case 'linux':
                this.renderLinux()

                break
            default:
                return false
        }
    }

    public constructor(options?: IGraphicPluginOptions) {
        this.options = options || {
            appName: "myApp",
            assets: {}
        }
    }

    public install() {
        if (typeof process === 'undefined') return false
        else {
            const { platform } = process

            if (!this.supportedPlatforms.includes(platform)) return false
            else {
                this.platform = platform
                this.renderer()

                return true
            }
        }
    }

    @OnTick({ interval: 30, type: 'before' })
    public tick() {
        this.renderer()
    }
}