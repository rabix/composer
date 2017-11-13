import {Observable} from "rxjs/Observable";
import {AppMetaEntry} from "../../../../electron/src/storage/types/app-meta";

export interface AppMetaManager {

    getAppMeta(key?: string): Observable<AppMetaEntry | any>;

    patchAppMeta(key: keyof AppMetaEntry, value: any): Promise<any>;

}
