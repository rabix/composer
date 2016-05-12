export interface FilePath {
    name: string;
    type: string;
    path: string;
    fullPath: string;
}

export interface FS {
    baseDir: string;
    paths: FilePath[]
}
