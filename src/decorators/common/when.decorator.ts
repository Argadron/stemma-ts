import type { WhenDecoratorProperties } from "@types";
import { generateSignalProxy, isStage3Dec, registerAnyDecorator } from "@decorators";

/**
 * Decorator marks this method as When condition method, what equals, method will be executed,
 * when When function returns true
 * @param param0 - When function
 */
export function When({ when }: Omit<WhenDecoratorProperties, 'methodName'>, signal?: string) {
    return (target: any, methodName: any, descriptor: PropertyDescriptor) => {
        let liveInstance: any = undefined

        if (isStage3Dec(target, methodName)) methodName.addInitializer(function (this: any) {
            liveInstance = this
        })

        registerAnyDecorator(target, methodName, 'whens', { when }, 'METHOD', signal ? (generateSignalProxy(() => liveInstance, signal, descriptor)) : undefined)
    }
}