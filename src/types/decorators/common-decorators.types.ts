import type { Game } from "@";
import type { BaseMethodDecorator } from "@types";

/**
 * Propeties for When decorator. Accepts When callback, must return true, if
 * need execute this method on next game tick
 */
export type WhenDecoratorProperties = BaseMethodDecorator & { readonly when: (game: Game) => boolean }