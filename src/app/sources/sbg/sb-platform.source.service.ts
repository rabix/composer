import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {DataEntrySource} from "../common/interfaces";
import {PlatformProjectEntry} from "../../services/api/platforms/platform-api.types";

@Injectable()
export class SBPlatformDataSourceService {

    constructor(private platform: PlatformAPI) {

    }

    public getProjects(): Observable<DataEntrySource[]> {

        return this.platform.getOwnProjects()
            .flatMap(Observable.from as any)
            .map((project: any) => {
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
            .map((app: any) => ({
                id: app.id,
                data: app,
                type: "file",
                language: Observable.of("json"),
                isWritable: project.membership.write,
                content: Observable.of(1).switchMap(_ => this.platform.getAppCWL(app)).publishReplay().refCount(),
                save: (jsonContent, revisionNote) => {
                    return this.platform.saveApp(jsonContent, revisionNote);
                }
            }))
            .reduce((acc, item) => acc.concat(item), []);
    }
}
