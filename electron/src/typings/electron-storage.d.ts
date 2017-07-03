declare module "electron-storage" {
    export function get<T extends Object>(filePath: string, callback?: (err?: Error, obj: T) => any): Promise<T>;

    export function set<T extends Object>(fileOrDirPath: string, data: string | T, callback?: (err?: Error, obj: T) => any): Promise<T>;


    export function remove<T extends Object>(fileOrDirPath: string, callback?: (err?: Error, obj: T) => any): Promise<T>;

    export function isPathExists(fileOrDirPath: string, callback?: (exists: boolean) => any): Promise<any>;

}
