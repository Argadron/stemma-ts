import type { IClient, ICommand } from "@interfaces";
import type { Default } from "@types";

export type NetworkCallback = <T = any>(event: string, data: Default<T>) => void
export type NetworkClientCallback = <T = any>(event: string, cb: (client: IClient, data: Default<T>) => void) => void