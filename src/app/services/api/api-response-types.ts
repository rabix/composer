export interface FilePath {
    name: string;
    type: string;
    path: string;
    fullPath: string;
    isEmpty?: boolean;
    content?: string;
}

export interface HttpError {
    message: string;
    statusCode: number;
    error: string;
}

export interface FS {
    baseDir: string;
    paths: FilePath[]
}
