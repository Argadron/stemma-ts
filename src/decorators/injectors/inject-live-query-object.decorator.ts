import type { InjectLiveQueryObjectDecoratorProperties } from "@types";
import { registerAnyDecorator } from "@decorators";

/**
 * Decorator marks to property as target to inject live query object (auto-filtrated objects)
 * @param param0 - Filtrate func
 */
export function InjectLiveQueryObject({ where }: Omit<InjectLiveQueryObjectDecoratorProperties, 'propertyName'>) {
    return (target: any, propertyName: string) => registerAnyDecorator(target, propertyName, 'liveQueriesObjects', { where }, 'PROPERTY')
}