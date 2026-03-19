import { registerAnyDecorator } from "../utils";

/**
 * Decorator marks this property as target to inject Game
 */
export function InjectCore() {
    return (target: any, propertyName: string) => registerAnyDecorator(target, propertyName, 'coreInjectings', null, 'PROPERTY')
}