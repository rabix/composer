export interface FilesystemEntry {
    dirname: string;
    isDir: boolean;
    isFile: boolean;
    isReadable: boolean;
    isWritable: boolean;
    language: string;
    name: boolean;
    path: "Workflow" | "CommandLineTool" | string;
    type: string;
}


export type FolderListing = FilesystemEntry[];
