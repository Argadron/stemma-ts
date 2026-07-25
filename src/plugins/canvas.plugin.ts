import type { Game } from "@core";
import type { IPlugin, ICanvasPluginOptions } from "@interfaces";
import type { Entity, GameObject } from "@world";
import type { Position, Position3D } from "@types";
import { CANVAS_BASE_ELEMENT_HEIGHT, CANVAS_BASE_ELEMENT_WIDTH, CANVAS_BASE_HEIGHT, CANVAS_BASE_WIDTH } from "@const";

/**
 * Plugin enable render on canvas HTML element (browser render)
 */
export class CanvasPlugin implements IPlugin {
    public readonly name = CanvasPlugin.name

    private readonly options: ICanvasPluginOptions;
    private readonly ctx: CanvasRenderingContext2D | null;
    private readonly assets = new Map<string, HTMLImageElement>();

    private drawImage(key: string, position: Position | Position3D) {
        const img = this.assets.get(key)

        if (img) this.ctx!.drawImage(img, position[0], position[1], img.width || CANVAS_BASE_WIDTH, img.height || CANVAS_BASE_HEIGHT)
    }

    private drawEntity(entity: Entity) {
        if (!this.ctx) return;

        const [x, y] = entity.position

        if (this.assets.has(entity.name)) this.drawImage(entity.name, entity.position)
        else {
            this.ctx.fillStyle = this.options.render?.defaultColor || 'black'
            this.ctx.fillRect(x, y, this.options.render?.defaultWidth || CANVAS_BASE_WIDTH, this.options.render?.defaultHeight || CANVAS_BASE_HEIGHT)
        }
    }

    private drawObject(object: GameObject) {
        if (!this.ctx) return;

        const [x, y] = object.position

        if (this.assets.has(object.name)) this.drawImage(object.name, object.position)
        else {
            this.ctx.fillStyle = this.options.render?.defaultColor || 'black'
            this.ctx.fillRect(x, y, this.options.render?.defaultWidth || CANVAS_BASE_WIDTH, this.options.render?.defaultHeight || CANVAS_BASE_HEIGHT)
        }
    }

    public constructor(options: ICanvasPluginOptions) {
        this.options = options
        this.options.canvas.width = options.width || CANVAS_BASE_ELEMENT_WIDTH
        this.options.canvas.height = options.height || CANVAS_BASE_ELEMENT_HEIGHT
        this.ctx = this.options.canvas.getContext("2d")

        if (options.assets) {
            for (const [key, value] of Object.entries(options.assets)) {
                const img = new Image()

                img.src = value.src
                img.height = value.height || CANVAS_BASE_HEIGHT
                img.width = value.width || CANVAS_BASE_WIDTH

                this.assets.set(key, img)
            }
        }
    }

    public install() {
        return !!this.ctx
    }

    public afterTick(game: Game) {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.options.canvas.width, this.options.canvas.height)
        game.options.manager.entities.forEach(e => this.drawEntity(e))
        game.options.map.objects.forEach(o => this.drawObject(o))
    }
}