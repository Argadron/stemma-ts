import type { OnTagsChangesDecoratorsProperties } from "@types";
import { generateSignalProxy, isStage3Dec, registerAnyDecorator } from "@decorators";

/**
 * Decorator marks this method as listener of any entity has new provided tag
 * @param tag - Tag to listen
 */
export function OnTagAdded({ tag }: Omit<OnTagsChangesDecoratorsProperties, 'methodName'>, signal?: string) {
    return (target: any, methodName: any, descriptor: PropertyDescriptor) => {
        let liveInstance: any = undefined
                
        if (isStage3Dec(target, methodName)) methodName.addInitializer(function (this: any) {
            liveInstance = this
        })
        
        registerAnyDecorator(target, methodName, 'tagAdds', { tag }, 'METHOD', signal ? (generateSignalProxy(() => liveInstance, signal, descriptor)) : undefined)
    }
}