import { anyWorldObjectIsGameObject, convertAnyPositionToPosition } from "@utils";
import type { Linkable } from "@types";
import type { IDeadData, ILink, ILinkOptions, IMovedData, IUseValidationContext } from "@interfaces";
import { USE_VALIDATION_EVENT_PREFIX } from "@const";
import { CommandType } from "@enums";
import type { Game } from "@core";

/**
 * Creates Link between two entities
 * @param from - Linkable WO from
 * @param to - Linkable WO to
 * @returns { ILink }
 */
export function useLink(from: Linkable, to: Linkable, options?: ILinkOptions): ILink {
    const game = useLink.prototype.game as Game || options?.game

    const parentIsEntity = !anyWorldObjectIsGameObject(from)
    const childIsEntity = !anyWorldObjectIsGameObject(to)

    let move: VoidFunction;
    let kill: VoidFunction;
    let deleting: VoidFunction;

    const link = {
        from,
        to,
        isActive: true,
        unLink: () => {
            if (move) move()
            if (kill) kill()
            if (deleting) deleting()

            link.isActive = false
        },
        link: (options?: ILinkOptions) => link.isActive ? false : useLink(from, to, options)
    } as ILink

    if (childIsEntity && options?.maxDistance) move = game.registerCustomEvent<IMovedData & IUseValidationContext>(`${USE_VALIDATION_EVENT_PREFIX}:${CommandType.MOVE}`, (opt, event, data) => {
        if (
            data.entity 
            && !anyWorldObjectIsGameObject(data.entity) 
            && data.entity.id === to.id
        ) {

            const [x1, y1] = from.position
            const [x2, y2] = convertAnyPositionToPosition(data.eventData.newPosition || (data.eventData as any).position)

            if (x2-x1 > options!.maxDistance! || y2-y1 > options!.maxDistance!) {
                data.eventData.isAllowed = false
                data.eventData.errors.push(`[useLink]: Max distance occured (${options!.maxDistance})`)
            }
            if (options.autoUnlinkOn?.includes("childOutOfRange")) link.unLink()
        }
    })
    if (parentIsEntity && childIsEntity) {
        if (options?.killChild) kill = game.on<IDeadData>("entityDead", (opt, event, data) => {
            if (data.eventData.entity.id === from.id) game.options.manager.kill(to.id)
            if (options.autoUnlinkOn?.includes("parentKilled")) link.unLink()
        })
        if (options?.deleteChild) deleting = game.on<{}>("entityDeleted", (opt, event, data) => {
            if (data.entity!.id === from.id) game.options.manager.delete(to.id)
            if (options.autoUnlinkOn?.includes("parentDeleted")) link.unLink()
        })
    }

    return link
}