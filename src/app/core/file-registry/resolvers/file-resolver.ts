import {FSEntrySource} from "../types";

export interface FileResolver {
    canResolve(path: string):boolean;
    fetch<T>(path: string): Promise<FSEntrySource<T>>;
}
