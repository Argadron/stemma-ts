import type { Game } from "@core";
import type { Linkable, UnlinkWhen } from "@types";

export interface ILink {
    /**
     * Parent of link
     */
    readonly from: Linkable;

    /**
     * Child of link
     */
    readonly to: Linkable;

    /**
     * Link destroy function
     */
    readonly unLink: VoidFunction;

    /**
     * Flag indicated link active status
     */
    isActive: boolean;

    /**
     * You can reactivate link, if then deleted
     * @param options - Optional new options to link
     * @returns { ILink | false } - ILink if relink success, false if link already exists
     */
    readonly link: (options?: ILinkOptions) => ILink | false;
}

export interface ILinkOptions {
    /**
     * Game reference, if you disabled 
     */
    readonly game?: Game;

    /**
     * Max distance between Child and Parent
     */
    readonly maxDistance?: number;

    /**
     * Kill child of link, if parent was killed
     */
    readonly killChild?: boolean;

    /**
     * Delete child of link, if parent was deleted
     */
    readonly deleteChild?: boolean;

    /**
     * Auto delete link when
     */
    readonly autoUnlinkOn?: UnlinkWhen[];

    /**
     * If true, register useLink as middleware
     */
    readonly enableMiddleware?: boolean;
}