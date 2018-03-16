import {PreviewJobManager} from "../tool-editor/dependencies";
import {GlobalAppMetaManager} from "./app-meta.factory";


export function previewJobSaverFactory(globalAppMetaManager: GlobalAppMetaManager): PreviewJobManager {
    return {
        get(appID: string) {
            return globalAppMetaManager.getMeta(appID, "testJob");
        },
        set(appID: string, job: Object) {
            return globalAppMetaManager.setMeta(appID, "testJob", job);
        }
    } as PreviewJobManager;
}
