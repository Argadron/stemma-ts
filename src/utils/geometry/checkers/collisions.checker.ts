import { BASE_MAX_WEIGHT_LIMIT_ON_POSITION } from "@const"
import { GameObjectEnum } from "@enums"
import type { IWorldItem } from "@interfaces"
import { anyWorldObjectIsGameObject, gameObjectIsChest, gameObjectIsItem } from "@utils"
import type { Entity, GameObject } from "@world"

/**
 * Checks collision between entity and potential array
 * @param entitesAndObjects - Array of collisions (on new position)
 * @param entity - World object
 * @returns { boolean } - True if collision, else false
 */
export function checkCollisions(entitesAndObjects: (Entity | GameObject)[], entity: Entity | GameObject): boolean {
    const totalWeight = entitesAndObjects.reduce((accum, objOrEntity) => {
                if (objOrEntity.id === entity.id) return accum
                if (anyWorldObjectIsGameObject(objOrEntity)) {
                    if (gameObjectIsChest(objOrEntity)) return accum += objOrEntity.metadata?.items.reduce((accum: number, chestItem: GameObject) => accum += (chestItem.metadata?.weight ?? 1), 0)
                    if (gameObjectIsItem(objOrEntity)) return accum += (objOrEntity.metadata?.weight ?? 1)
                    else return accum
                }
                else return accum
            }, 0)
            let isCollision = false
    
            if (entitesAndObjects.length === 0) return false
            else {
                for (const collision of entitesAndObjects) {
                    if (collision.id !== entity.id) {
                        const entityIsEntity = !anyWorldObjectIsGameObject(entity)
                        const collisionIsEntity = !anyWorldObjectIsGameObject(collision)
    
                        if (entityIsEntity) {
                            if (!collisionIsEntity) {
                                if (collision.type !== GameObjectEnum.ITEM && collision.type !== GameObjectEnum.TRIGGER) {
                                    isCollision = true
    
                                    break
                                }
                            }
                            else {
                                if (!collision.isDead) {
                                    isCollision = true
    
                                    break
                                }
                            }
                        }
                        if (!collisionIsEntity) {
                            if (collision.type !== GameObjectEnum.ITEM && 
                                collision.type !== GameObjectEnum.TRIGGER &&
                                (!entityIsEntity && entity.type !== GameObjectEnum.ITEM && entity.type !== GameObjectEnum.TRIGGER)
                            ) {
                                isCollision = true
    
                                break
                            }
                            if (!entityIsEntity && entity.type === GameObjectEnum.ITEM) {
                                const entityCheckCollision = (entity as IWorldItem).metadata?.weight as number ?? 1
    
                                if ((totalWeight + entityCheckCollision) >= BASE_MAX_WEIGHT_LIMIT_ON_POSITION) {
                                    isCollision = true
    
                                    break
                                }
                            }
                        }
                        else {
                            if (!collision.isDead) {
                                isCollision = true
    
                                break
                            }
                        }
                    }
                }
    
                return isCollision
            }
}