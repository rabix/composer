import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {ProfileCredentialEntry, ProfileCredentials} from "../../../electron/src/user-profile/profile";
import {IpcService} from "../../services/ipc.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {BehaviorSubject, Subject} from "rxjs";

@Injectable()
export class DataGatewayService {

    scans          = new Subject<Observable<any>>();
    scanCompletion = new BehaviorSubject<string>("");

    constructor(private preferences: UserPreferencesService,
                private ipc: IpcService) {

    }


    scan(creds?) {
        const c    = creds ? Observable.of(creds) : this.preferences.get("credentials");
        const scan = c.switchMap(credentials => this.ipc.request("scanPlatforms", {credentials}))
            .publishReplay(1)
            .refCount();

        scan.subscribe(this.scanCompletion);

        return scan;
    }

    getDataSources(): Observable<ProfileCredentials> {
        return this.preferences.get("credentials").map((credentials: ProfileCredentials) => {

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

    /**
     * Gets the top-level data listing for a data source
     * @param source "default", "igor"
     * @returns {any}
     */
    getPlatformListing(source: string): Observable<{ id: string, name: string }[]> {

        return this.scanCompletion.flatMap(s => this.preferences.get(`dataCache.${source}.projects`))
            .do(p => console.log("Projects", p));
    }

    getProjectListing(profile, projectName): Observable<any[]> {

        return this.scanCompletion.flatMap(() => this.preferences.get(`dataCache.${profile}.apps`)).map((apps: any[] = []) => {
            return apps.filter(app => app["sbg:projectName"] === projectName);
        });
    }

    getFolderListing(folder) {
        return this.ipc.request("readDirectory", folder);
    }

    getLocalListing() {
        return this.preferences.get("localFolders", []);
    }

    getLocalFile(path) {
        return this.ipc.request("readFileContent", path);
    }

    searchLocalProjects(term, limit = 20) {
        return this.ipc.request("searchLocalProjects", {term, limit});
    }

    searchUserProjects(term: string, limit = 20) {
        return this.ipc.request("searchUserProjects", {term, limit});
    }

    getPublicApps() {
        return this.scanCompletion.flatMap(() => this.preferences.get("dataCache", {})).map(profiles => {
            const mainProfile = Object.keys(profiles)[0];
            if (mainProfile) {
                return profiles[mainProfile]["publicApps"] || [];
            }

            return [];
        });
    }

    searchPublicApps(term: any, limit = 20) {
        return this.ipc.request("searchPublicApps", {term, limit});
    }
}
