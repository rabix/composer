import {InjectionToken} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {AppMetaEntry} from "../../../electron/src/storage/types/app-meta";
import {AppHelper} from "../core/helpers/AppHelper";
import {LocalRepositoryService} from "../repository/local-repository.service";
import {PlatformRepositoryService} from "../repository/platform-repository.service";

export const GlobalAppMetaManagerToken = new InjectionToken("app.appMetaManager");

export interface GlobalAppMetaManager {

    getMeta<T extends keyof AppMetaEntry>(appID: string, key?: T): Observable<AppMetaEntry[T]>;

    setMeta<T extends keyof AppMetaEntry>(appID: string, key: T, value: AppMetaEntry[T]): Promise<any>;
}

export function globalAppMetaManagerFactory(localRepository: LocalRepositoryService,
                                            platformRepository: PlatformRepositoryService): GlobalAppMetaManager {

    function getMeta<T extends keyof AppMetaEntry>(appID: string, key?: T): Observable<AppMetaEntry[T]> {
        const isLocal = AppHelper.isLocal(appID);
        if (isLocal) {
            return localRepository.getAppMeta(appID, key);
        } else {
            return platformRepository.getAppMeta(appID, key);
        }
    }

    function setMeta<T extends keyof AppMetaEntry>(appID: string, key: T, value: AppMetaEntry[T]) {
        const isLocal = AppHelper.isLocal(appID);
        if (isLocal) {
            return localRepository.patchAppMeta(appID, key, value);
        } else {
            return platformRepository.patchAppMeta(appID, key, value);
        }
    }

    return {getMeta, setMeta};
}
