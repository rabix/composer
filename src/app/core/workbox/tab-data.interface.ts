export interface TabData<T> {
    id: string,
    label: string;
    type: "CommandLineTool" | "Workflow" | "Settings" | "Code" | "Welcome" | "NewFile";
    data?: T;
}
