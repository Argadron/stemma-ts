import type { OnTagsChangesDecoratorsProperties } from "@types";
import { generateSignalProxy, isStage3Dec, registerAnyDecorator } from "@decorators";

/**
 * Decorator marks this method as listener of any entity deleted provided tag
 * @param tag - Tag to listen
 */
export function OnTagDeleted({ tag }: Omit<OnTagsChangesDecoratorsProperties, 'methodName'>, signal?: string) {
    return (target: any, methodName: any, descriptor: PropertyDescriptor) => {
        let liveInstance: any = undefined
                        
        if (isStage3Dec(target, methodName)) methodName.addInitializer(function (this: any) {
            liveInstance = this
        })
        
        registerAnyDecorator(target, methodName, 'tagRemovs', { tag }, 'METHOD', signal ? (generateSignalProxy(() => liveInstance, signal, descriptor)) : undefined)
    }
}