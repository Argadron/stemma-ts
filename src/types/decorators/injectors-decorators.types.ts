import type { BasePropertyDecorator } from "@types";
import type { Entity, GameObject } from "@world";

/**
 * Properties for InjectStoreValue decorator
 */
export type InjectStoreValueDecoratorProperties = BasePropertyDecorator & { readonly key: string }

/**
 * Properties for InjectLiveQuery decorator
 */
export type InjectLiveQueryDecoratorProperties = BasePropertyDecorator & { readonly all: string[]; readonly none?: string[]; readonly where?: (e: Entity, event: "entity_created" | "entity_deleted" | "scanner") => boolean, readonly includeDeaths?: boolean }

/**
 * Properties for inject live query object decorator
 */
export type InjectLiveQueryObjectDecoratorProperties = BasePropertyDecorator & { readonly where: (o: GameObject, event: "object_created" | "object_deleted" | 'scanner') => boolean }