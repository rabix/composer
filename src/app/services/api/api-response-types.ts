export interface FilePath {
    name: string;
    type: string;
    path: string;
    fullPath: string;
    isEmpty?: boolean;
}

export interface FS {
    baseDir: string;
    paths: FilePath[]
}
