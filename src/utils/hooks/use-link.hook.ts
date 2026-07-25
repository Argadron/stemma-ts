import { anyWorldObjectIsGameObject, convertAnyPositionToPosition, positionIsPosition } from "@utils";
import type { GeometryToPosition, Linkable, Position, Position3D } from "@types";
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

    function checkMaximum(before: Position | Position3D, after: Position | Position3D): boolean {
        const [x1, y1, z1] = before
        const [x2, y2, z2] = after

        return positionIsPosition(before, '2D') ? (x2-x1 > options?.maxDistance! || y2-y1 > options?.maxDistance!) : (x2-x1 > options?.maxDistance! || y2-y1 > options?.maxDistance! || z2!-z1! > options?.maxDistance!)
    }

    if (options?.enableMiddleware) game.use((cmd, next) => {
        if (cmd.type !== CommandType.MOVE || typeof options.maxDistance === 'undefined') return next()
        else return checkMaximum(from.position, cmd.data.position || cmd.data.newPosition) ? null : next()
    })
    else {
        if (childIsEntity && options?.maxDistance) move = game.registerCustomEvent<IMovedData & IUseValidationContext>(`${USE_VALIDATION_EVENT_PREFIX}:${CommandType.MOVE}`, (opt, event, data) => {
        if (
            data.entity 
            && !anyWorldObjectIsGameObject(data.entity) 
            && data.entity.id === to.id
        ) {
            if (checkMaximum(from.position, convertAnyPositionToPosition(data.eventData.position))) {
                data.eventData.isAllowed = false
                data.eventData.errors.push(`[useLink]: Max distance occured (${options!.maxDistance})`)

                if (options.autoUnlinkOn?.includes("childOutOfRange")) link.unLink()
            }
        }
        })
        if (parentIsEntity && childIsEntity) {
        if (options?.killChild) kill = game.on<IDeadData>("entityDead", (opt, event, data) => {
            if (data.eventData.entity.id === from.id) {
                game.options.manager.kill(to.id)

                if (options.autoUnlinkOn?.includes("parentKilled")) link.unLink()
            }
        })
        if (options?.deleteChild) deleting = game.on<{}>("entityDeleted", (opt, event, data) => {
            if (data.entity!.id === from.id) {
                game.options.manager.delete(to.id)

                if (options.autoUnlinkOn?.includes("parentDeleted")) link.unLink()
            }
        })
        }
    }

    return link
}