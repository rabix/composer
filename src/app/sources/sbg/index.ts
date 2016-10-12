import {Observable, BehaviorSubject} from "rxjs";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {DataEntrySource, SB_PLATFORM_SOURCE_ID} from "../common/interfaces";
import {PlatformAppEntry, PlatformProjectEntry} from "../../services/api/platforms/platform-api.types";
import {Injectable} from "@angular/core";

@Injectable()
export class SBPlatformDataSource {

    constructor(private platform: PlatformAPI) {

    }

    public load(): Observable<DataEntrySource[]> {

        // We will fetch all the projects and apps for the current user and combine them into a tree
        return Observable.zip(this.platform.getOwnProjects(), this.platform.getApps(),
            (projects: PlatformProjectEntry[], apps: PlatformAppEntry[]) => {

                const appsPerProject = apps.map(app => ({
                    id: app.id,
                    data: app,
                    type: "file",
                    save: () => {
                        // this.platform.
                    },
                    content: this.platform.getAppCWL(app).switchMap(cwl => new BehaviorSubject(cwl)),
                    language: Observable.of("json")

                }) as DataEntrySource).reduce((acc, app) => {
                    const appProject = app.data["sbg:project"];
                    acc[appProject]  = [].concat.apply(acc[appProject] || [], [app]);
                    return acc;
                }, {});

                return projects.map(p => ({
                    id: p.id,
                    data: p,
                    sourceId: this.getSourceID(),
                    childrenProvider: () => {
                        if (!appsPerProject[p.path]) {
                            return Observable.of([]);
                        }

                        return Observable.of(appsPerProject[p.path].map(app => Object.assign(app, {
                                isWritable: p.membership.write
                            })) || [])
                    }


                }) as DataEntrySource);
            });
    }

    public getSourceID() {
        return SB_PLATFORM_SOURCE_ID;
    }
}
