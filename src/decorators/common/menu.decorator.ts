import type { Game } from "@core"
import { CanvasPlugin, ConsolePlugin, GraphicPlugin } from "@plugins"
import type { MenuDecoratorOptions, MenuOutputType } from "@types"
import { registerAnyDecorator } from "@decorators"
import { exec } from "child_process"

/**
 * Decorator marks this Geneartor method as a Menu
 * Menu transform generator into Promise, that will completed
 * after all choises ends.
 * Your generator must return String choise text
 * @param customOutput - Custom UI output plugin options
 * @param { Game } core - Game, if your plugin doesnt has 'core' or 'game' property
 */
export function Menu({ customUIPropeties, browserProperties, name }: MenuDecoratorOptions, core?: Game) {
    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        registerAnyDecorator(target, methodName, 'menuList', { name }, 'METHOD')

        const original = descriptor.value

        descriptor.value = function (...args: any[]) {
            const iterator: Generator = original.apply(this, args)
            const plugin = this as any
            const game = plugin.core as Game ?? plugin.game as Game ?? core

            if (!game) throw new Error('[Menu]: Decorator error. Game is undefined')

            const plugins = game.getAllPlugins().map(plugin => plugin.name)

            let outputGuiType: MenuOutputType | undefined = undefined;
            let outputPluginName: string;

            for (const currentPlugin of plugins) { 
                if (currentPlugin === ConsolePlugin.name || currentPlugin === GraphicPlugin.name) {
                    outputGuiType = 'APP'
                    outputPluginName = currentPlugin
                }
                else if (currentPlugin === CanvasPlugin.name) {
                    outputGuiType = 'BROWSER'
                    outputPluginName = currentPlugin
                }
                
                if (customUIPropeties && currentPlugin === customUIPropeties.name) {
                    outputGuiType = customUIPropeties.outputType
                    outputPluginName = currentPlugin
                }
            }

            if (!outputGuiType) throw new Error('[Menu]: can`t find output UI plugin')
            
            return new Promise((resolve, reject) => {
                function step(value?: any) {
                    try {
                        const result = iterator.next(value)
                        const resultValue = result.value

                        if (result.done) return resolve(resultValue)
                        else {
                            switch(outputGuiType) {
                                case 'APP':
                                    if (outputPluginName === ConsolePlugin.name) {
                                        process.stdout.write(resultValue)
                                        process.stdin.once('data', (data: string) => step(data))
                                    }
                                    else {
                                        exec(`zenity --entry --title="${resultValue}" --text="Ваш выбор:"`, (err, out) => {
                                            if (err) return reject(err)
                                            else return step(out.trim())
                                        })
                                    }

                                    break
                                case 'BROWSER':
                                    if (!browserProperties) throw new Error('[Menu]: undefined browser properties with Browser output type')
                                    else {
                                        function buttonListener() {
                                            step(browserProperties?.valueEl.value)

                                            browserProperties?.button.removeEventListener('click', buttonListener)
                                        }
                                         
                                        browserProperties.button.addEventListener('click', buttonListener)
                                        browserProperties.renderEl.innerText = resultValue
                                    }

                                    break
                            }
                        }
                    } catch (error) {
                        reject(error)
                    }
                }

                step()
            })
        }

        return descriptor
    }
}