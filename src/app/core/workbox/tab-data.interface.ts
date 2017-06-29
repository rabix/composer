export interface TabData<T> {
    id: string;
    label: string;
    isWritable?: boolean;
    language?: string;
    type: "CommandLineTool" | "Workflow" | "Settings" | "Code" | "Welcome" | "NewFile" | string;
    data?: T;
    position?: number;
    openTime?: number;
}
