/**
 * Generate random ID
 * @returns {number} - A random id
 */
export function createId(): number {
    return Math.floor((Math.random() * 10000) + Date.now())
}