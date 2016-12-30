import {OpaqueToken} from "@angular/core";
import {Subject} from "rxjs";
export const FILE_RESOLVERS: OpaqueToken = new OpaqueToken("FILE_RESOLVERS_TOKEN");

export interface FSEntrySource<T> {
    id: any;
    metadata: T;
    isReadable: boolean;
    isWritable: boolean;
}

export interface FileSource<T> extends FSEntrySource {
    save?: (...args: any[]) => Promise<FileSource>;
    content?: Subject<string>,
    language?: Subject<string>,
}

export interface DirectorySource<T> extends FSEntrySource {
    childrenProvider?: (...args: any[]) => Subject<FSEntrySource<T>>
}
