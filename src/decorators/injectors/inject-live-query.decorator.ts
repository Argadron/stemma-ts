import type { InjectLiveQueryDecoratorProperties } from "@types";

/**
 * Decorator marks this property to inject live-query (auto filtrated entities)
 * @param param0 - Filtrate tags
 */
export function InjectLiveQuery({ all, none, where, includeDeaths }: Omit<InjectLiveQueryDecoratorProperties, 'propertyName'>) {
    return (target: any, propertyName: string) => {
        if (!target.__liveQueries) target.__liveQueries = []

        target.__liveQueries.push({ all, none, propertyName, where, includeDeaths })
    }
}