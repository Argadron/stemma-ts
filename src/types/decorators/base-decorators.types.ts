import type { Signal } from "@interfaces"

/**
 * Base method decorator properties type
 */
export type BaseMethodDecorator = { readonly methodName: string }

/**
 * Base property properties type
 */
export type BasePropertyDecorator = { readonly propertyName: string }

/**
 * Properties to emit signal
 */
export type SignalProperties = { readonly signal: Signal, readonly descriptor: PropertyDescriptor, readonly signalKey: string }