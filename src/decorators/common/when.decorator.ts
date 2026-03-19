import type { WhenDecoratorProperties } from "@types";
import { registerAnyDecorator } from "../utils";

/**
 * Decorator marks this method as When condition method, what equals, method will be executed,
 * when When function returns true
 * @param param0 - When function
 */
export function When({ when }: Omit<WhenDecoratorProperties, 'methodName'>) {
    return (target: any, methodName: string) => registerAnyDecorator(target, methodName, 'whens', { when }, 'METHOD')
}