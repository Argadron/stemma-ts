import type { Game } from "@core";
import type { BaseMethodDecorator } from "@types";

/**
 * Propeties for When decorator. Accepts When callback, must return true, if
 * need execute this method on next game tick
 */
export type WhenDecoratorProperties = BaseMethodDecorator & { readonly when: (game: Game) => boolean }

/**
 * Properties for custom UI Plugin menu renderer
 */
export type MenuDecoratorCustomUIProperties = { readonly name: string, readonly outputType: MenuOutputType }

/**
 * Properties for Browser Menu, where button - element to add listener menu,
 * valueEl - element with value property, to read menu choise
 * renderEl - Element to see innerText
 */
export type MenuDecoratorBrowserProperties = { readonly button: HTMLElement, readonly valueEl: HTMLInputElement, readonly renderEl: HTMLElement }

/**
 * Type of menu decorator options
 */
export type MenuDecoratorOptions = {
    readonly customUIPropeties?: MenuDecoratorCustomUIProperties;
    readonly browserProperties?: MenuDecoratorBrowserProperties;
}

/**
 * Types of render Menu
 */
export type MenuOutputType = 'BROWSER' | 'APP'