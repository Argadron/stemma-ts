import { registerAnyDecorator } from "@decorators";

/**
 * Decorator marks property for target to inject global store value
 * @param key - Key from GlobalStore to inject value
 */
export function InjectStoreValue(key: string) {
    return (target: any, propertyName: string) => registerAnyDecorator(target, propertyName, 'injectedValues', undefined, 'PROPERTY')
}