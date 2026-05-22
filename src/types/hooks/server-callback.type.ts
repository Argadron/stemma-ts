import type { IServerCallbackReturn } from "@interfaces";

/**
 * Callback must return valid JS code
 * return format: {
 *   signature,
 *   cmd
 * }
 * @example
 * (signature) => 
 *  return {
 *      signature,
 *      cmd: 'console.log(123)'
 *  }
 */
export type ServerCallback = (signature: string) => IServerCallbackReturn;