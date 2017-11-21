export type RabixMessageTypes = "ERROR" | "INFO" | "DEBUG" | "WARN";
export type CustomTypes = "DONE" | "OUTDIR" | "STATUS";
export type MessageType = RabixMessageTypes | CustomTypes;

export interface ExecutorOutput {
    type?: MessageType,
    message: string,
    timestamp?: string;
}
