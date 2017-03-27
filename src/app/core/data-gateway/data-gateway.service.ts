import {Injectable} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Http} from "@angular/http";
import * as YAML from "js-yaml";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
import {ProfileCredentials} from "../../../../electron/src/user-profile/profile";
import {PlatformAPIGatewayService} from "../../auth/api/platform-api-gateway.service";
import {noop} from "../../lib/utils.lib";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {IpcService} from "../../services/ipc.service";
import {ConnectionState} from "../../services/storage/user-preferences-types";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {ModalService} from "../../ui/modal/modal.service";
import Platform = NodeJS.Platform;

@Injectable()
export class DataGatewayService {

    private cache = {};

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
                private modal: ModalService,
                private apiGateway: PlatformAPIGatewayService,
                private ipc: IpcService) {

        this.ipc.request("hasDataCache").take(1).subscribe(hasCache => {
            if (hasCache) {
                this.scanCompletion.next("");
            }
        });
    }

    getDataSources(): Observable<ProfileCredentials> {
        return this.preferences.getCredentials().map((credentials) => {

            const local = {
                hash: "local",
                label: "Local Files",
                profile: "local",
                status: ConnectionState.Connected
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
        }).distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b));
    }

    /**
     * Gets the top-level data listing for a data source
     * @param source hash
     * @returns {any}
     */
    getPlatformListing(source: string): Observable<{ id: string, name: string }[]> {

        return this.throughCache(
            `${source}.getPlatformListing`,
            this.apiGateway.forHash(source).getRabixProjects().publishReplay(1).refCount()
        );

        // const allProjects  = this.scanCompletion.flatMap(s => this.preferences.get(`dataCache.${source}.projects`, []));
        // const openProjects = this.preferences.get("openProjects", [])
        //     .map(projects => projects
        //         .filter(p => p.startsWith(source + "/"))
        //         .map(p => p.slice(source.length + 1))
        //     );
        //
        // return Observable.combineLatest(allProjects, openProjects, (all = [], open) => {
        //     return all.filter(project => open.indexOf(project.slug) !== -1);
        // });
    }

    getProjectListing(hash, projectOwner: string, projectSlug: string): Observable<any[]> {
        return this.throughCache(
            hash + ".getProjectListing",
            this.apiGateway.forHash(hash).getProjectApps(projectOwner, projectSlug).publishReplay(1).refCount()
        );


        // return this.scanCompletion.flatMap(() => this.preferences.get(`dataCache.${profile}.apps`)).map((apps: any[] = []) => {
        //     return apps.filter(app => app["sbg:projectName"] === projectName);
        // });
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

    fetchFileContent(almostID: string, parse = false) {

        const source = DataGatewayService.getFileSource(almostID);
        console.log("File source is", source, "for", almostID);

        if (source === "local") {
            const request = this.ipc.request("readFileContent", almostID).take(1);

            if (parse) {
                return request.map(content => {
                    try {
                        return YAML.safeLoad(content, {json: true, onWarning: noop} as any);
                    } catch (err) {
                        return new Error(err);
                    }
                });
            }

            return request;
        }

        if (source === "app") {
            // ID example, all concatenated:
            // default_1b2a8fed50d9402593a57acddc7d7cfe/ivanbatic+admin/
            // dfghhm/ivanbatic+admin/dfghhm/
            // whole-genome-analysis-bwa-gatk-2-3-9-lite/2
            const [hash, , , ownerSlug, projectSlug, appSlug, revision] = almostID.split("/");

            return this.apiGateway.forHash(hash)
                .getApp(ownerSlug, projectSlug, appSlug, revision)
                .map(app => JSON.stringify(app, null, 4));
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
            return Observable.of(content).map(txt => YAML.safeLoad(txt, {json: true} as any));
        }

        return this.ipc.request("resolveContent", ({content, path})).take(1);
    }


    saveLocalFileContent(path, content) {
        return this.ipc.request("saveFileContent", {path, content});
    }

    saveFile(fileID, content): Observable<string> {
        const fileSource = DataGatewayService.getFileSource(fileID);

        if (fileSource === "public") {
            return Observable.throw("Cannot save a public file.");
        }

        if (fileSource === "local") {
            return this.saveLocalFileContent(fileID, content).map(() => content);
        }

        /**
         * File ID sample:
         * "default_1b2a8fed50d9402593a57acddc7d7cfe/ivanbatic+admin/dfghhm/ivanbatic+admin/dfghhm/sbg-flatten/0"
         */

        const [hash] = fileID.split("/");

        const revNote = new FormControl("");
        return Observable.fromPromise(this.modal.prompt({
            title: "Publish New App Revision",
            content: "Revision Note",
            cancellationLabel: "Cancel",
            confirmationLabel: "Publish",
            formControl: revNote
        })).flatMap(() => {

            return this.apiGateway.forHash(hash)
                .saveApp(YAML.safeLoad(content, {json: true} as any), revNote.value)
                .map(r => JSON.stringify(r.message, null, 4));
        });
    }

    private throughCache(key, handler) {
        if (this.cache[key]) {
            return this.cache[key];
        }

        this.cache[key] = handler;

        return this.cache[key];
    }

}
