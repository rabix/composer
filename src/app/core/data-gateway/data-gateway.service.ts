import {Injectable} from "@angular/core";
import {FormControl} from "@angular/forms";
import {Http} from "@angular/http";
import * as YAML from "js-yaml";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {PlatformAPIGatewayService} from "../../auth/api/platform-api-gateway.service";
import {noop} from "../../lib/utils.lib";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {IpcService} from "../../services/ipc.service";
import {ConnectionState, CredentialsEntry} from "../../services/storage/user-preferences-types";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {ModalService} from "../../ui/modal/modal.service";
import Platform = NodeJS.Platform;
import {AuthService} from "../../auth/auth/auth.service";
import {PlatformAppEntry} from "../../services/api/platforms/platform-api.types";

@Injectable()
export class DataGatewayService {

    cacheInvalidation = new Subject<string>();

    static getFileSource(id): "local" | "public" | "app" {
        if (id.startsWith("/")) {
            return "local";
        }

        if (id.includes("sbg-public-data")) {
            return "public";
        }

        return "app";
    }

    constructor(private preferences: UserPreferencesService,
                private api: PlatformAPI,
                private http: Http,
                private modal: ModalService,
                private auth: AuthService,
                private apiGateway: PlatformAPIGatewayService,
                private ipc: IpcService) {
    }

    getDataSources(): Observable<CredentialsEntry[]> {
        return this.auth.connections.map((credentials) => {

            const local = {
                hash: "local",
                label: "Local Files",
                profile: "local",
                status: ConnectionState.Connected
            } as CredentialsEntry;

            const remote = credentials.map(c => {

                let label = c.profile;

                if (c.profile === "cgc") {
                    label = "Cancer Genomics Cloud";
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
     * @param hash hash
     * @returns {any}
     */
    getPlatformListing(hash: string): Observable<{ id: string, name: string }[]> {

        const platform = this.apiGateway.forHash(hash);

        const call = platform ? platform.getRabixProjects()
            : Observable.throw(
                new Error("Cannot get rabix projects because you are not connected to the necessary platform."));

        return this.throughCache(
            `${hash}.getPlatformListing`, call
        ) as Observable<{ id: string, name: string }[]>;
    }

    getProjectListing(hash, projectOwner: string, projectSlug: string): Observable<any[]> {
        const cacheKey = hash + `.getProjectListing.${projectOwner}.${projectSlug}`;

        const platform = this.apiGateway.forHash(hash);

        const call = platform ? platform.getProjectApps(projectOwner, projectSlug)
            : Observable.throw(
                new Error("Cannot get project apps because you are not connected to the necessary platform."));

        return this.throughCache(cacheKey, call) as Observable<any[]>;
    }

    invalidateProjectListing(hash, owner: string, project: string) {
        this.invalidateCache(`${hash}.getProjectListing.${owner}.${project}`);
    }

    checkIfPathExists(path) {
        return this.ipc.request("pathExists", path);
    }

    createLocalFolder(folderPath) {
        return this.ipc.request("createDirectory", folderPath);
    }

    getFolderListing(folder) {
        return this.throughCache(`readDirectory.${folder}`, this.ipc.request("readDirectory", folder));
    }

    invalidateFolderListing(folder) {
        this.cacheInvalidation.next(`readDirectory.${folder}`);
    }

    getLocalListing() {
        return this.preferences.get("localFolders", []);
    }

    searchLocalProjects(term, limit = 20) {

        return this.preferences.get("localFolders", []).switchMap(folders => this.ipc.request("searchLocalProjects", {
            term,
            limit,
            folders
        })).take(1);
    }

    searchUserProjects(term: string, limit = 20): Observable<{ hash: string, results: PlatformAppEntry[] }[]> {
        return this.auth.connections.take(1).flatMap(credentials => {
            const hashes = credentials.map(c => c.hash);
            const requests = hashes.map(hash => {

                    const platform = this.apiGateway.forHash(hash);

                    return platform ? platform.searchUserProjects(term, limit).map(results => ({results, hash}))
                        : Observable.throw(
                            new Error("Cannot get public apps because you are not connected to the necessary platform."));

                });

            return Observable.zip(...requests);
        });
    }

    getPublicApps(hash) {

        const platform = this.apiGateway.forHash(hash);

        const call = platform ? platform.getPublicApps()
            : Observable.throw(
                new Error("Cannot get public apps because you are not connected to the necessary platform."));

        return this.throughCache(
            hash + ".getPublicApps", call);
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

        if (source === "app" || source === "public") {
            // ID example, all concatenated:
            // default_1b2a8fed50d9402593a57acddc7d7cfe/ivanbatic+admin/
            // dfghhm/ivanbatic+admin/dfghhm/
            // whole-genome-analysis-bwa-gatk-2-3-9-lite/2
            const [h, , , ownerSlug, projectSlug, appSlug, revision] = almostID.split("/");

            const [hash] = h.split("?");

            const platform = this.apiGateway.forHash(hash);

            const fetch = platform ? platform.getApp(ownerSlug, projectSlug, appSlug, revision)
                : Observable.throw(
                    new Error("Cannot open the app because you are not connected to the necessary platform."));

            if (parse) {
                return fetch;
            }
            return fetch.map(app => JSON.stringify(app, null, 4));
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
        })).catch(() => {
            // In case when you click on Cancel button or Esc button on your keyboard
            return Observable.empty()
        }).flatMap(() => {
            const platform = this.apiGateway.forHash(hash);

            const call = platform ? platform.saveApp(YAML.safeLoad(content, {json: true} as any), revNote.value)
                : Observable.throw(
                    new Error("Could not save the app because you are not connected to the necessary platform."));

            return call.map(r => JSON.stringify(r.message, null, 4));

        });
    }

    private throughCache(key, handler) {
        return new Observable(subscriber => {
            const cacheSub = Observable.merge(
                Observable.of(1),
                this.cacheInvalidation.filter(k => k === key)
            ).flatMap(() => handler).subscribe(subscriber);

            return () => {
                cacheSub.unsubscribe();
            };

        }).publishReplay().refCount();
    }

    static fuzzyMatch(needle, haystack) {

        const noSpaceNeedle = needle.replace(/ /g, "");
        const hlen          = haystack.length;
        const nlen          = noSpaceNeedle.length;

        if (nlen > hlen) {
            return 0;
        }
        if (nlen === hlen) {
            return 1;
        }
        let matchedCharacters = 0;
        const spacings        = [];

        let previousFoundIndex = 0;

        outer: for (let i = 0, j = 0; i < nlen; i++) {
            const nch = noSpaceNeedle.charCodeAt(i);
            while (j < hlen) {
                if (haystack.charCodeAt(j++) === nch) {
                    spacings.push(j - previousFoundIndex);
                    previousFoundIndex = j;
                    matchedCharacters++;

                    continue outer;
                }
            }
            return 0;
        }
        const totalDistance  = spacings.reduce((acc, n) => acc + n, 0);
        const adjacencyBonus = haystack.length / (totalDistance * (haystack.length / spacings.length));
        const indexBonus     = needle.split(" ").map(word => haystack.indexOf(word)).reduce((acc, idx) => acc + Number(idx !== -1), 0);
        const bonus          = adjacencyBonus + indexBonus;

        return bonus + matchedCharacters / hlen;
    }

    getProjectsForAllConnections(all = false) {
        return this.auth.connections.flatMap((credentials: any) => {
            const listings = credentials.map(creds => this.getPlatformListing(creds.hash));

            if (listings.length === 0) {
                return Observable.of([]);
            }

            return Observable.zip(...listings);
        }, (credentials, listings) => ({credentials, listings}));
    }

    invalidateCache(key: string) {
        this.cacheInvalidation.next(key);
    }
}
