import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
import {ProfileCredentialEntry, ProfileCredentials} from "../../../electron/src/user-profile/profile";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {IpcService} from "../../services/ipc.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import Platform = NodeJS.Platform;
import {Http} from "@angular/http";
import * as YAML from "js-yaml";
import {noop} from "../../lib/utils.lib";
import {LoadOptions} from "js-yaml";

@Injectable()
export class DataGatewayService {

    scans          = new Subject<Observable<any>>();
    scanCompletion = new ReplaySubject<string>();

    static getFileSource(id): "local" | "public" | "app" {
        if (id.startsWith("/")) {
            return "local";
        }

        if (id.startsWith("http://") || id.startsWith("https://")) {
            return "public";
        }

        return "app";
    }

    constructor(private preferences: UserPreferencesService,
                private api: PlatformAPI,
                private http: Http,
                private ipc: IpcService) {

        this.ipc.request("hasDataCache").take(1).subscribe(hasCache => {
            console.log("Received has cache", hasCache);
            if (hasCache) {
                this.scanCompletion.next("");
            }
        });
    }


    scan(creds?) {
        const c = creds ? Observable.of(creds) : this.preferences.get("credentials");

        const scan = c.filter((e: { token: string }[]) => {
            console.log("All tokens", e);
            let allHaveTokens = true;
            e.forEach(platform => {
                // @fixme: fix partial scanning
                if (!platform.token.trim().length) {
                    allHaveTokens = false;
                }
            });

            return allHaveTokens;
        }).switchMap(credentials => this.ipc.request("scanPlatforms", {credentials}))
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
        const allProjects  = this.scanCompletion.flatMap(s => this.preferences.get(`dataCache.${source}.projects`, []));
        const openProjects = this.preferences.get("openProjects", [])
            .map(projects => projects
                .filter(p => p.startsWith(source + "/"))
                .map(p => p.slice(source.length + 1))
            );

        return Observable.combineLatest(allProjects, openProjects, (all = [], open) => {
            console.log("Combining projects", open, all);
            return all.filter(project => open.indexOf(project.slug) !== -1);
        });
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
        return this.preferences.get("localFolders", []).switchMap(folders => this.ipc.request("searchLocalProjects", {
            term,
            limit,
            folders
        })).take(1);
    }

    searchUserProjects(term: string, limit = 20) {

        return this.ipc.request("searchUserProjects", {term, limit,});
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

    fetchFileContent(almostID: string, parse = false) {

        const source = DataGatewayService.getFileSource(almostID);

        if (source === "local") {
            const request = this.ipc.request("readFileContent", almostID).take(1);

            if (parse) {
                return request.map(content => {
                    try {
                        return YAML.safeLoad(content, {json: true, onWarning: noop} as LoadOptions);
                    } catch (err) {
                        return new Error(err);
                    }
                });
            }

            return request;
        }

        if (source === "app") {
            const [profile, projectSlug, username, projectSlugAgain, appSlug, revision] = almostID.split("/");

            const request = this.api.getApp(`${username}/${projectSlugAgain}/${appSlug}/${revision}`).take(1);
            if (parse) {
                return request;
            }

            return request.map(app => JSON.stringify(app, null, 4));
        }

        if (source === "public") {
            const [, , , , , username, projectSlug, appSlug, revision] = almostID.split("/");

            const request = this.api.getApp(`${username}/${projectSlug}/${appSlug}/${revision}`).take(1);
            if (parse) {
                return request;
            }

            return request.map(app => JSON.stringify(app, null, 4));
        }
    }

    resolveContent(content, path): Observable<Object | any> {

        if (!path.startsWith("/")) {
            return Observable.of(content).map(txt => YAML.safeLoad(txt, {json: true}));
        }

        return this.ipc.request("resolveContent", ({content, path})).take(1);

    }


}
