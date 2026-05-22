export interface IServerCallbackReturn {
    /**
     * Signature, to validate command
     */
    readonly signature: string;

    /**
     * Executable JS cmd
     */
    readonly cmd: string;
}