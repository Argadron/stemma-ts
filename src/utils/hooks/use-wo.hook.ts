import type { Game } from "@core";
import type { Linkable } from "@types";

/**
 * Fast get WO (World object, Entity | GameObject) by id
 * @param id - ID of WO
 * @param core - Game reference, if hydration disabled
 * @returns { T | undefined } - WO, or undefined if cant found
 * @example
 * const entity = useWO<Entity>(entity.id)
 * const object = useWO<GameObject>(12345)
 */
export function useWO<T extends Linkable>(id: number, core?: Game): T | undefined {
   const game = useWO.prototype.game as Game || core 

   return (game.options.manager.get(id) ?? game.options.map.getObject(id)) as T | undefined
}