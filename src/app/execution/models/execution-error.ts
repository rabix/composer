export type ExecutionErrorType = "execution" | "requirement";

export class ExecutionError {

    /**
     * Leave 0-255 are reserved for Unix exit codes
     */
    readonly code: number;
    readonly message: string;
    readonly type: ExecutionErrorType;


    constructor(code: number, message = "", type: ExecutionErrorType = "execution") {
        this.code    = code;
        this.message = message;
        this.type    = type;
    }


}
