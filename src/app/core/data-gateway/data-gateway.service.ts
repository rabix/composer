import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {ProfileCredentialEntry, ProfileCredentials} from "../../../electron/src/user-profile/profile";
import {IpcService} from "../../services/ipc.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";

@Injectable()
export class DataGatewayService {

    private scans = new ReplaySubject<string>();

    constructor(private profile: UserPreferencesService,
                private ipc: IpcService) {

        this.scans.next("");
    }

    scan() {
        return this.profile.get("lastScanTime").take(1)
            .switchMap(timestamp => {
                // Skip for 1h
                if (!timestamp || timestamp < (Date.now().valueOf() - 3600000 )) {
                    return this.ipc.request("scanPlatforms").do(() => {
                        this.profile.put("lastScanTime", Date.now().valueOf());
                        this.scans.next("");
                    });
                } else {
                    return Observable.of("");
                }
            });

    }

    getDataSources(): Observable<ProfileCredentials> {
        return this.profile.get("credentials").map((credentials: ProfileCredentials) => {

            const local: ProfileCredentialEntry = {
                label: "Local Files",
                profile: "local",
                connected: true
            };

            const remote = credentials.map(c => {

                let label = c.profile;

                if (c.profile === "cgc") {
                    label = "CGC";
                } else if (c.profile === "default" || c.profile === "igor") {
                    label = "Seven Bridges";
                }

                return {...c, label};
            });

            return [local, ...remote];
        });
    }

    getPublicSources() {

    }

    /**
     * Gets the top-level data listing for a data source
     * @param source "default", "igor"
     * @returns {any}
     */
    getPlatformListing(source: string): Observable<{ id: string, name: string }[]> {

        return this.scans.flatMap(s => this.profile.get(`dataCache.${source}.projects`))
            .do(p => console.log("Projects", p));
    }

    getProjectListing(profile, projectName): Observable<any[]> {

        return this.profile.get(`dataCache.${profile}.apps`).map((apps: any[] = []) => {
            return apps.filter(app => app["sbg:projectName"] === projectName);
        });
    }

    getFolderListing(folder) {
        return this.ipc.request("readDirectory", folder);
    }

    getLocalListing() {
        return this.profile.get("workspace.localFolders", []);
    }

    getApp(platform, appID) {
        return this.ipc.request("fetchApp", {
            platform,
            appID
        });
    }
}
