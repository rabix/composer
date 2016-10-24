import {Observable, BehaviorSubject} from "rxjs";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {DataEntrySource, SB_PLATFORM_SOURCE_ID} from "../common/interfaces";
import {PlatformAppEntry, PlatformProjectEntry} from "../../services/api/platforms/platform-api.types";
import {Injectable} from "@angular/core";

@Injectable()
export class SBPlatformDataSourceService {

    constructor(private platform: PlatformAPI) {

    }

    public getProjects(): Observable<DataEntrySource[]> {

        return this.platform.getOwnProjects()
            .flatMap(Observable.from as any)
            .map(project => {
                return {
                    id: project.id,
                    data: project,
                    childrenProvider: this.makeChildrenProvider(project)
                }
            })
            .reduce((acc, p) => acc.concat(p), []);
    }

    private makeChildrenProvider(project: PlatformProjectEntry) {

        return () => this.platform
            .getProjectApps(project.owner_canonical, project.slug)
            .flatMap(Observable.from as any)
            .map(app => ({
                id: app.id,
                data: app,
                type: "file",
                language: Observable.of("json"),
                isWritable: project.membership.write,
                content: this.platform.getAppCWL(app).switchMap(cwl => new BehaviorSubject(cwl)),
                save: (jsonContent, revisionNote) => {
                    return this.platform.saveApp(jsonContent, revisionNote);
                }
            }))
            .reduce((acc, item) => acc.concat(item), []);
    }
}
