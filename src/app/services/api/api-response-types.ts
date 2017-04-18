export interface FilePath {
    name: string;
    type: string;
    relativePath: string;
    absolutePath: string;
    isEmpty?: boolean;
    content?: string;
}
