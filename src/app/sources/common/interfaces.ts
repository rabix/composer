import {Observable} from "rxjs";
import {Response} from "@angular/http";

export type SB_PLATFORM_SOURCE_ID = "sb_platform";
export type SB_PUBLIC_SOURCE_ID = "sb_public";
export type LOCAL_FS_SOURCE_ID = "local";

export type DATA_SOURCE_ID =
    SB_PLATFORM_SOURCE_ID
        | SB_PUBLIC_SOURCE_ID
        | LOCAL_FS_SOURCE_ID;

export interface DataEntrySource<T, K> {
    id: string;
    data: T;
    type: "file" | "folder",
    isWritable: boolean;
    save: (...args: any[])=>Observable<Response>
    sourceId: DATA_SOURCE_ID;
    content: Observable<string>,
    language: Observable<string>,
    childrenProvider?: () => Observable<DataEntrySource<K>[]>;
}