import {Injectable} from "@angular/core";
import "rxjs/add/operator/publishReplay"
import "rxjs/add/operator/shareReplay"
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {RecentAppTab} from "../../../electron/src/storage/types/recent-app-tab";
import {AuthCredentials} from "../auth/model/auth-credentials";
import {TabData} from "../core/workbox/tab-data.interface";
import {IpcService} from "../services/ipc.service";

@Injectable()
export class LocalRepositoryService {

    private localFolders: ReplaySubject<string[]>                     = new ReplaySubject(1);
    private openTabs: ReplaySubject<TabData<any>[]>                   = new ReplaySubject(1);
    private expandedFolders: ReplaySubject<string[]>                  = new ReplaySubject(1);
    private recentApps: ReplaySubject<RecentAppTab[]>                 = new ReplaySubject(1);
    private credentials: ReplaySubject<AuthCredentials[]>             = new ReplaySubject(1);
    private activeCredentials: ReplaySubject<AuthCredentials>         = new ReplaySubject(1);
    private selectedAppsPanel: ReplaySubject<"myApps" | "publicApps"> = new ReplaySubject(1);
    private publicAppsGrouping: ReplaySubject<"toolkit" | "category"> = new ReplaySubject(1);

    constructor(private ipc: IpcService) {

        this.listen("openTabs").subscribe(this.openTabs);
        this.listen("recentApps").subscribe(this.recentApps);
        this.listen("localFolders").subscribe(this.localFolders);
        this.listen("expandedNodes").subscribe(this.expandedFolders);
        this.listen("selectedAppsPanel").subscribe(this.selectedAppsPanel);
        this.listen("publicAppsGrouping").subscribe(this.publicAppsGrouping);
        this.listen("activeCredentials").map(cred => AuthCredentials.from(cred)).subscribe(this.activeCredentials);
        this.listen("credentials").map(creds => creds.map(c => AuthCredentials.from(c))).subscribe(this.credentials);
    }

    getSelectedAppsPanel(): Observable<"myApps" | "publicApps"> {
        return this.selectedAppsPanel;
    }

    setSelectedAppsPanel(selectedAppsPanel: "myApps" | "publicApps"): Promise<any> {
        return this.patch({selectedAppsPanel}).toPromise();
    }

    getPublicAppsGrouping(): Observable<"toolkit" | "category"> {
        return this.publicAppsGrouping;
    }

    setPublicAppsGrouping(publicAppsGrouping: "toolkit" | "category"): Promise<any> {
        return this.patch({publicAppsGrouping}).toPromise();
    }

    getLocalFolders(): Observable<string[]> {
        return this.localFolders;
    }

    getOpenTabs(): Observable<TabData<any>[]> {
        return this.openTabs;
    }

    getRecentApps(): Observable<RecentAppTab[]> {
        return this.recentApps;
    }

    getExpandedFolders(): Observable<string[]> {
        return this.expandedFolders;
    }

    getCredentials(): Observable<AuthCredentials[]> {
        return this.credentials;
    }

    getActiveCredentials(): Observable<AuthCredentials> {
        return this.activeCredentials;
    }

    setActiveCredentials(activeCredentials: AuthCredentials = null): Promise<any> {
        // return this.ipc.request("patchLocalRepository", {activeCredentials}).toPromise();
        return this.ipc.request("switchActiveUser", {credentials: activeCredentials})
            .toPromise();
    }

    setCredentials(credentials: AuthCredentials[]): Promise<any> {

        return this.activeCredentials.take(1).flatMap(activeCredentials => {
            const updateContainsActive = credentials.findIndex(c => c.equals(activeCredentials)) !== -1;

            const update = {credentials} as { credentials: AuthCredentials[], activeCredentials?: AuthCredentials };

            if (!updateContainsActive) {
                update.activeCredentials = null;
            }

            return this.ipc.request("patchLocalRepository", update);
        }).toPromise();
    }

    setFolderExpansion(nodeID: string, expanded: boolean): void {
        this.expandedFolders.take(1)
            .subscribe(expandedFolders => {
                const index = expandedFolders.indexOf(nodeID);

                const shouldBeAdded   = expanded && index === -1;
                const shouldBeRemoved = !expanded && index !== -1;

                const patch = expandedFolders.slice();

                if (shouldBeAdded) {
                    patch.push(nodeID);
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

    private listen(key: string) {
        return this.ipc.watch("watchLocalRepository", {key});
    }

    private patch(data: { [key: string]: any }): Observable<any> {
        return this.ipc.request("patchLocalRepository", data);
    }

    addLocalFolders(...folders): Promise<any> {
        return this.getLocalFolders().take(1).toPromise().then(existingFolders => {
            const missing = folders.filter(folder => existingFolders.indexOf(folder) === -1);

            if (missing.length === 0) {
                return Promise.resolve();
            }

            return this.patch({
                localFolders: existingFolders.concat(missing)
            }).toPromise();
        });
    }

    removeLocalFolders(...folders): Promise<any> {
        return this.getLocalFolders().take(1).toPromise().then(existing => {
            const update = existing.filter(path => folders.indexOf(path) === -1);

            if (update.length === existing.length) {
                return Promise.resolve();
            }

            return this.patch({
                localFolders: update
            }).toPromise();
        });
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
}
