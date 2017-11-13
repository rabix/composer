import {AppMetaEntry} from "../../../../electron/src/storage/types/app-meta";
import {AppEditorBase} from "../../editor-common/app-editor-base/app-editor-base";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {AppHelper} from "../helpers/AppHelper";
import {AppMetaManager} from "./app-meta-manager";
import {InjectionToken} from "@angular/core";

export function appMetaManagerFactory(editor: AppEditorBase,
                                      localRepository: LocalRepositoryService,
                                      platformRepository: PlatformRepositoryService): AppMetaManager {

    const appID = editor.tabData.id;

    if (AppHelper.isLocal(appID)) {
        return {
            getAppMeta: (key?: keyof AppMetaEntry) => localRepository.getAppMeta(appID, key),
            patchAppMeta: (key: keyof AppMetaEntry, value: any) => localRepository.patchAppMeta(appID, key, value)
        } as AppMetaManager;

    } else {
        return {
            getAppMeta: (key?: keyof AppMetaEntry) => platformRepository.getAppMeta(appID, key),
            patchAppMeta: (key: keyof AppMetaEntry, value: any) => platformRepository.patchAppMeta(appID, key, value)
        } as AppMetaManager;
    }

}

export const APP_META_MANAGER = new InjectionToken("appMetaManager");
