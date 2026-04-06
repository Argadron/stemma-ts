import type { GameEvent } from "@enums";
import type { BaseMethodDecorator } from "@types";

/**
 * Properties for OnEvent decorator
 */
export type OnEventDecoratorProperties = BaseMethodDecorator & { readonly event: keyof typeof GameEvent }

/**
 * Properties for OnCustomEvent decorator
 */
export type OnCustomEventDecoratorProperties = BaseMethodDecorator & { readonly event: string }

/**
 * Properties for OnTickDecorator
 */
export type OnTickDecoratorProperties = BaseMethodDecorator & { readonly interval: number; readonly type?: 'before' | 'after' }

/**
 * Properites for all tags listeners decorators
 */
export type OnTagsChangesDecoratorsProperties = BaseMethodDecorator &  { readonly tag: string }

/**
 * Properties for UIEvent decorator
 */
export type OnUIEventDecoratorProperties = BaseMethodDecorator & OnCustomEventDecoratorProperties & { readonly id: string }

/**
 * Properties for ConsoleKeyboardEvent decorator
 */
export type OnConsoleKeyboardEventDecoratorProperites = BaseMethodDecorator & { readonly key: string | RegExp }