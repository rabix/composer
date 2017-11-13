import {InjectionToken} from "@angular/core";
import {AppHelper} from "../../../core/helpers/AppHelper";
import {LocalRepositoryService} from "../../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../../repository/platform-repository.service";
import {WorkflowEditorComponent} from "../../workflow-editor.component";
import {JobService} from "./job.service";

export function jobServiceFactory(editor: WorkflowEditorComponent,
                                  local: LocalRepositoryService,
                                  platform: PlatformRepositoryService) {


    const appID      = editor.tabData.id;
    const isLocalApp = AppHelper.isLocal(appID);

    if (isLocalApp) {
        return new JobService({
            getJob: () => local.getAppMeta(appID, "job"),
            setJob: (data) => local.patchAppMeta(appID, "job", data)
        });
    }

    return new JobService({
        getJob: () => platform.getAppMeta(appID, "job"),
        setJob: (data) => platform.patchAppMeta(appID, "job", data)
    });


}

export const JOB_SERVICE_TOKEN = new InjectionToken("job.service.factory");
