export interface IUseVisibiltyResult {
    /**
     * Indicates observer can see target
     */
    readonly isVisible: boolean;

    /**
     * How well observer can see target
     */
    readonly factor: number;
}