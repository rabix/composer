export interface FilesystemEntry {
    dirname: string;
    isDir: boolean;
    isFile: boolean;
    isReadable: boolean;
    isWritable: boolean;
    language: string;
    name: boolean;
    path: string;
    type: "Workflow" | "CommandLineTool" | string;
}
