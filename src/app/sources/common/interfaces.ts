import {Observable} from "rxjs/Observable";

export type SB_PLATFORM_SOURCE_ID = "sb_platform";
export type SB_PUBLIC_SOURCE_ID = "sb_public";
export type LOCAL_FS_SOURCE_ID = "local";

export type DATA_SOURCE_ID =
    SB_PLATFORM_SOURCE_ID
    | SB_PUBLIC_SOURCE_ID
    | LOCAL_FS_SOURCE_ID;

export interface DataEntrySource {
    id: string;
    data?: any;
    type?: "file" | "folder";
    isWritable?: boolean;
    resolve?: (content?: string) => Promise<string>;
    save?: ((...args: any[]) => Observable<any>);
    sourceId?: DATA_SOURCE_ID;
    content?: Observable<string> | any;
    language?: Observable<string> | any;
    childrenProvider?: () => Observable<DataEntrySource[]> | any;
}
