import type { OnConsoleKeyboardEventDecoratorProperites } from "@types";
import { generateSignalProxy, isStage3Dec, registerAnyDecorator } from "@decorators";

export function OnConsoleKeyboardEvent({ key }: Omit<OnConsoleKeyboardEventDecoratorProperites, 'methodName'>, signal?: string) {
    return (target: any, methodName: any, descriptor: PropertyDescriptor) => {
        let liveInstance: any = undefined
        
        if (isStage3Dec(target, methodName)) methodName.addInitializer(function (this: any) {
            liveInstance = this
        })

        registerAnyDecorator(target, methodName, 'consoleListeners', { key }, 'METHOD', signal ? (generateSignalProxy(() => liveInstance, signal, descriptor)) : undefined)
    }
}