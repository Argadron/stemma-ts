import type { InjectLiveQueryDecoratorProperties } from "@types";
import { registerAnyDecorator } from "@decorators";

/**
 * Decorator marks this property to inject live-query (auto filtrated entities)
 * @param param0 - Filtrate tags
 */
export function InjectLiveQuery({ all, none, where, includeDeaths }: Omit<InjectLiveQueryDecoratorProperties, 'propertyName'>) {
    return (target: any, propertyName: string) => registerAnyDecorator(target, propertyName, 'liveQueries', {
        all, none, where, includeDeaths
    }, 'PROPERTY')
}