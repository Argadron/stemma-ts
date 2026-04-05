import type { OnTagsChangesDecoratorsProperties } from "@types";
import { registerAnyDecorator } from "../utils/decorators-utils.js";

/**
 * Decorator marks this method as listener of any entity has new provided tag
 * @param tag - Tag to listen
 */
export function OnTagAdded({ tag }: Omit<OnTagsChangesDecoratorsProperties, 'methodName'>) {
    return (target: any, methodName: string) => registerAnyDecorator(target, methodName, 'tagAdds', { tag }, 'METHOD')
}