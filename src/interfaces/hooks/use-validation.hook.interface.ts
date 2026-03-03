export interface IUseValidationResult {
    /**
     * Indicates, can this action will do
     */
    isAllowed: boolean;

    /**
     * Array of errors, with reason, why action cant be executed
     */
    readonly errors: string[];

    /**
     * Callback executing (dispatch) action, returns true if success, else false
     * @param data - Data to executing command
     * @returns { boolean } - True if correct executing, else false
     */
    readonly confirm: <T>(data: T) => boolean;
}