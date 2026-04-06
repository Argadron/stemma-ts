import type { OnConsoleKeyboardEventDecoratorProperites } from "@types";
import { registerAnyDecorator } from "@decorators";

export function OnConsoleKeyboardEvent({ key }: Omit<OnConsoleKeyboardEventDecoratorProperites, 'methodName'>) {
    return (target: any, methodName: string) => registerAnyDecorator(target, methodName, 'consoleListeners', { key }, 'METHOD')
}