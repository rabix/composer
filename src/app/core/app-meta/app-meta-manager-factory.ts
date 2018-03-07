import {InjectionToken} from "@angular/core";
import {AppMetaEntry} from "../../../../electron/src/storage/types/app-meta";
import {AppEditorBase} from "../../editor-common/app-editor-base/app-editor-base";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {AppHelper} from "../helpers/AppHelper";
import {AppMetaManager} from "./app-meta-manager";
import {map} from "rxjs/operators";

export function appMetaManagerFactory(editor: AppEditorBase,
                                      localRepository: LocalRepositoryService,
                                      platformRepository: PlatformRepositoryService): AppMetaManager {

    const appID = editor.tabData.id;

    if (AppHelper.isLocal(appID)) {
        return {
            getAppMeta: (key?: keyof AppMetaEntry) => localRepository.getAppMeta(appID, key).pipe(
                map(ensureObject)
            ),
            patchAppMeta: (key: keyof AppMetaEntry, value: any) => localRepository.patchAppMeta(appID, key, ensureObject(value))
        } as AppMetaManager;

    } else {
        return {
            getAppMeta: (key?: keyof AppMetaEntry) => platformRepository.getAppMeta(appID, key).pipe(
                map(ensureObject)
            ),
            patchAppMeta: (key: keyof AppMetaEntry, value: any) => platformRepository.patchAppMeta(appID, key, ensureObject(value))
        } as AppMetaManager;
    }

}

function ensureObject(value) {
    if (Object.prototype.isPrototypeOf(value)) {
        return value;
    }

    return {};
}

export const AppMetaManagerToken = new InjectionToken("appMetaManager");
