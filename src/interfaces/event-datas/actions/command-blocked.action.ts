import type { ICommand } from "@interfaces";

export interface ICommandBlocked {
    /**
     * Blocked command
     */
    readonly command: ICommand;
}