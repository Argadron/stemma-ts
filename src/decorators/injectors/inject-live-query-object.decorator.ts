import type { InjectLiveQueryObjectDecoratorProperties } from "@types";

/**
 * Decorator marks to property as target to inject live query object (auto-filtrated objects)
 * @param param0 - Filtrate func
 */
export function InjectLiveQueryObject({ where }: Omit<InjectLiveQueryObjectDecoratorProperties, 'propertyName'>) {
    return (target: any, propertyName: string) => {
        if (!target.__liveQueriesObjects) target.__liveQueriesObjects = []

        target.__liveQueriesObjects.push({ where, propertyName })
    }
}