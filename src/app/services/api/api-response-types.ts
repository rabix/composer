export interface FilePath extends HttpError {
    name: string;
    type: string;
    path: string;
    fullPath: string;
    isEmpty?: boolean;
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
