import type { OnConsoleKeyboardEventDecoratorProperites } from "@types";
import { registerAnyDecorator } from "@decorators";

/**
 * Decorator marks this method as listener of form input keys
 * @param param0 - Key to listen
 */
export function OnKeyInputedGraphic({ key }: Omit<OnConsoleKeyboardEventDecoratorProperites, 'methodName'>) {
    return (target: any, methodName: string) => registerAnyDecorator(target, methodName, 'graphicListeners', { key }, 'METHOD')
}