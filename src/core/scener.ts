import type { Game } from "@core";
import type { ICommand } from "@interfaces";
import { AsyncPlugin } from "@plugins";
import { createId } from "@utils";

/**
 * Util class for creates Scenes (dont wait promise)
 * @example
 * const scener = new Scener(game)
 * 
 * const myFirstScene = scener.createScene([]) // array of ICommand
 * 
 * // launch scene (you can dont use await)
 * void playScene(myFirstScene)
 * 
 * // or, if you need await
 * const sceneTwo = scener.createScene([])
 * 
 * async function launchScenes() {
 *   await Promise.all([
 *      scener.playScene(myFirstScene),
 *      scener.playScene(sceneTwo)
 *  ])
 * 
 *  console.log('hello') // will be executed after 2 scenes
 * }
 * 
 * void launchScenes()
 */
export class Scener {
    private readonly scenes = new Map<number, ICommand[]>();
    private readonly asyncPlugin: AsyncPlugin;

    public constructor(game: Game) {
        const plugin = game.getPlugin(AsyncPlugin.name) as AsyncPlugin | undefined

        if (!plugin) throw new Error(`${Scener.name}: Async plugin is required`)
        else this.asyncPlugin = plugin
    }

    public createScene(commands: ICommand[]) {
        const id = createId()

        this.scenes.set(id, commands)

        return id
    }

    public async playScene(id: number) {
        const scene = this.scenes.get(id)

        if (!scene) return false
        else {
            for (const cmd of scene) await this.asyncPlugin.asyncExecute(cmd)

            return true
        }
    }
}