import {Injectable} from "@angular/core";

import * as Yaml from "js-yaml";
import {LoadOptions} from "js-yaml";

import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {App} from "../../../electron/src/sbg-api-client/interfaces/app";
import {Project} from "../../../electron/src/sbg-api-client/interfaces/project";
import {RawApp} from "../../../electron/src/sbg-api-client/interfaces/raw-app";
import {RecentAppTab} from "../../../electron/src/storage/types/recent-app-tab";
import {TabData} from "../core/workbox/tab-data.interface";
import {IpcService} from "../services/ipc.service";

@Injectable()
export class PlatformRepositoryService {

    private apps: ReplaySubject<App[]>                = new ReplaySubject(1);
    private publicApps: ReplaySubject<App[]>          = new ReplaySubject(1);
    private projects: ReplaySubject<Project[]>        = new ReplaySubject(1);
    private openProjects: ReplaySubject<string[]>     = new ReplaySubject(1);
    private expandedNodes: ReplaySubject<string[]>    = new ReplaySubject(1);
    private openTabs: ReplaySubject<TabData<any>[]>   = new ReplaySubject(1);
    private recentApps: ReplaySubject<RecentAppTab[]> = new ReplaySubject(1);

    constructor(private ipc: IpcService) {

        this.listen("apps").subscribe(this.apps);
        this.listen("projects").subscribe(this.projects);
        this.listen("openTabs").subscribe(this.openTabs);
        this.listen("publicApps").subscribe(this.publicApps);
        this.listen("recentApps").subscribe(this.recentApps);
        this.listen("openProjects").subscribe(this.openProjects);
        this.listen("expandedNodes").subscribe(this.expandedNodes);
    }

    getOpenTabs(): Observable<TabData<any>[]> {
        return this.openTabs;
    }

    getAppsForProject(projectID): Observable<App[]> {
        return this.apps.map(apps => apps.filter(app => app.project === projectID));
    }

    getProjects(): Observable<Project[]> {
        return this.projects;
    }

    getPublicApps(): Observable<App[]> {
        return this.publicApps;
    }

    getPrivateApps(): Observable<App[]> {
        return this.apps;
    }

    getRecentApps(): Observable<RecentAppTab[]> {
        return this.recentApps;
    }

    fetch(): Observable<any> {
        return this.ipc.request("fetchPlatformData");
    }

    getOpenProjects(): Observable<Project[]> {
        return Observable
            .combineLatest(this.projects, this.openProjects)
            .map(data => {
                const [all, open] = data;
                if (open.length === 0) return [];

                const mapped = all.reduce((acc, item) => ({...acc, [item.id]: item}), {});
                return open.map(id => mapped[id] || undefined).filter(v => v);
            })
    }

    getClosedProjects(): Observable<Project[]> {
        return Observable.combineLatest(this.projects, this.openProjects)
            .map(data => {
                const [all, open] = data;

                if (open.length === 0) return all;

                return all.filter(p => open.indexOf(p.id) === -1);
            });
    }

    private listen(key: string) {
        return this.ipc.watch("watchUserRepository", {key});
    }

    private patch(data: { [key: string]: any }) {
        return this.ipc.request("patchUserRepository", data);
    }

    setNodeExpansion(id: string, isExpanded: boolean): void {
        this.expandedNodes.take(1).subscribe(expandedNodes => {
            const index = expandedNodes.indexOf(id);

            const shouldBeAdded   = isExpanded && index === -1;
            const shouldBeRemoved = !isExpanded && index !== -1;

            const patch = expandedNodes.slice();

            if (shouldBeAdded) {
                patch.push(id);
            } else if (shouldBeRemoved) {
                patch.splice(index, 1);
            }

            if (shouldBeAdded || shouldBeRemoved) {
                this.patch({
                    expandedNodes: patch
                });
            }
        });
    }

    addOpenProjects(...projectIDs: string[]) {
        return this.openProjects.take(1).toPromise().then(openProjects => {

            const missing = projectIDs.filter(id => openProjects.indexOf(id) === -1);

            if (missing.length) {
                return this.patch({openProjects: openProjects.concat(missing)}).toPromise();
            }

            return Promise.resolve();
        });
    }

    removeOpenProjects(...projectIDs: string[]) {
        return this.openProjects.take(1).toPromise().then(openProjects => {

            const update = openProjects.filter(id => projectIDs.indexOf(id) === -1);

            if (update.length !== openProjects.length) {
                return this.patch({openProjects: update}).toPromise();
            }

            return Promise.resolve();
        });
    }

    getExpandedNodes() {
        return this.expandedNodes;
    }


    createApp(appID: string, content: string): Promise<string> {
        return this.ipc.request("createPlatformApp", {
            id: appID,
            content: content
        }).toPromise();
    }

    saveAppRevision(appID: string, content: string, revisionNote?: string): Promise<string> {

        const appContent = Yaml.safeLoad(content, {json: true} as LoadOptions);
        if (typeof revisionNote === "string") {
            appContent["sbg:revisionNotes"] = revisionNote;
        }
        content = JSON.stringify(appContent, null, 4);

        return this.ipc.request("saveAppRevision", {
            id: appID,
            content: content
        }).toPromise();
    }

    pushRecentApp(recentTabData: RecentAppTab, limit = 20): Promise<any> {
        return this.getRecentApps().take(1).toPromise().then((entries) => {
            const update = [recentTabData].concat(entries).filter((val, idx, arr) => {
                const duplicateIndex = arr.findIndex(el => el.id === val.id);
                return duplicateIndex === idx;
            }).slice(0, limit);

            return this.patch({recentApps: update}).toPromise();
        });
    }

    setOpenTabs(openTabs: TabData<any>[]): Promise<any> {
        return this.patch({openTabs}).toPromise();
    }

    getUpdates(appIDs: string[]): Promise<{
        id: string;
        name: string;
        revision: number;
    }[]> {
        return this.ipc.request("getAppUpdates", {appIDs}).toPromise();
    }

    getApp(id: string): Promise<RawApp> {
        return this.ipc.request("getPlatformApp", {id}).toPromise().then((appText: string) => {
            return JSON.parse(appText);
        });
    }

    searchAppsFromOpenProjects(substring?: string): Observable<App[]> {

        const term = substring.toLowerCase();

        return this.getOpenProjects().flatMap(openProjects => {

            const openProjectIDs = openProjects.map(project => project.id);

            return this.getPrivateApps().map(apps => {

                return apps.filter(app => {

                    if (openProjectIDs.indexOf(app.project) === -1) {
                        return false;
                    }

                    if (!substring) {
                        return true;
                    }

                    const appID   = app.id.toLowerCase();
                    const appName = app.name.toLowerCase();

                    return appID.indexOf(term) !== -1 || appName.indexOf(term) !== -1;
                });
            });
        });
    }

    searchPublicApps(substring?: string): Observable<App[]> {
        const term = substring.toLowerCase();

        return this.getPublicApps().map(apps => {
            return apps.filter(app => {

                if (!substring) {
                    return true;
                }

                const appID   = app.id.toLowerCase();
                const appName = app.name.toLowerCase();

                return appID.indexOf(term) !== -1 || appName.indexOf(term) !== -1;
            });
        });
    }
}
