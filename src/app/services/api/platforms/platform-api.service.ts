import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import {ENVP} from "../../../config/env.config";
import {Observable, ReplaySubject} from "rxjs";
import {PlatformAppEntry, PlatformProjectEntry} from "./platform-api.types";
import {SettingsService} from "../../settings/settings.service";

export interface PlatformProject {
    id: string;
    href: string;
    name: string;
}

export interface PlatformApp {
    id: string;
    href: string;
    name: string;
    project: string;
}

export interface PlatformAppDetails extends PlatformApp {
    revision: number
    raw: Object
}

export interface ServiceConfig {
    port?: number,
    prefix?: string
}

@Injectable()
export class PlatformAPI {

    private sessionID = new ReplaySubject(1);

    private platformServices: {brood: string, watson: string, gatekeeper: string} = {};

    constructor(private http: Http, private settings: SettingsService) {

        this.settings.platformConfiguration.subscribe(config => {

            Object.keys(ENVP.serviceRoutes).forEach(serviceName => {
                this.platformServices[serviceName] = this.getServiceUrl(config.url, serviceName);
            });

            // If we do not reset the session ID upon the connection change,
            // the race condition with other api calls will take the old one
            this.sessionID = new ReplaySubject(1);

            this.checkToken(config.url, config.key).filter(isValid => isValid === true)
                .switchMap(_ => this.http.post(this.platformServices.gatekeeper + "/session/open/auth", {}, {
                    headers: new Headers({
                        "auth-token": config.key
                    })
                })).subscribe(
                res => {
                    this.sessionID.next(res.json().message.session_id);
                });
        });
    }

    public checkToken(platform: string, token: string) {
        const url = this.getServiceUrl(platform, "gatekeeper");

        return this.http.get(url + "/auth_token/check", {
            headers: new Headers({
                "auth-token": token
            })
        }).catch(res => Observable.of(res)).map(res => {

            if (res.status === 0) {
                return "invalid_platform";
            }

            return res.ok;
        });
    }

    private getServiceUrl(platformUrl: string, serviceName: string) {
        const isVayu    = platformUrl.indexOf("-vayu.sbgenomics.com") !== -1;
        const isStaging = platformUrl.indexOf("staging-igor.sbgenomics.com") !== -1;

        let serviceUrl = platformUrl.replace("igor", serviceName);

        if (isVayu) {
            serviceUrl = serviceUrl + ":" + ENVP.serviceRoutes[serviceName].port;
        } else if (isStaging) {
            serviceUrl = serviceUrl.replace("staging-igor", `staging-${serviceName}`);
        }

        return [serviceUrl, ENVP.serviceRoutes[serviceName].prefix].join("/");
    }

    public getApps(): Observable<PlatformAppEntry[]> {
        return this.sessionID.switchMap(sessionID => this.http.get(this.platformServices.brood + "/apps", {
            search: "_role=minimal",
            headers: new Headers({
                "session-id": sessionID
            })
        }).map(r => r.json().message)).first();
    }

    public getOwnProjects(): Observable<PlatformProjectEntry[]> {
        return this.sessionID.switchMap(sessionID => this.http.get(this.platformServices.watson + "/projects", {
            search: "_role=minimal&is_rabix=true",
            headers: new Headers({
                "session-id": sessionID
            })
        }).map(r => r.json().message.map(project => Object.assign(project, {
            path: `${project.created_by_username}/${project.slug}`
        })))).first();
    }

    public getAppCWL(app) {

        return this.sessionID.switchMap(sessionID => this.http.get(`${this.platformServices.brood}/raw/${app["sbg:id"]}`, {
            headers: new Headers({
                "session-id": sessionID
            })
            // Platform CWL files don't come with newlines
        })).map(r => JSON.stringify(r.json(), null, 4));
    }

    public getPublicApps() {
        return this.sessionID.switchMap(sessionID => this.http.get(`${this.platformServices.brood}/apps`, {
            search: "_order_by=label&visibility=public",
            headers: new Headers({
                "session-id": sessionID
            })
        }).map(r => r.json().message)).first();
    }

    public getApp(id) {
        return this.sessionID.switchMap(sessionID => this.http.get(`${this.platformServices.brood}/apps/${id}`, {
            headers: new Headers({
                "session-id": sessionID
            })
        }).map(r => r.json().message)).first();
    }

    public saveApp(app: PlatformAppEntry, revisionNote: string) {

        // Take the App id without the revision id
        let appPath = app["sbg:id"].split("/");
        appPath.pop();
        appPath = appPath.join("/");

        // Checkout the newest version of this App to get the latest revision
        return this.sessionID.switchMap(sessionID => this.getApp(appPath).flatMap(latestApp => {
            const nextRevision = (latestApp["sbg:latestRevision"] || 0) + 1;
            const endpoint     = `${this.platformServices.brood}/apps/${appPath}/${nextRevision}`;

            return this.http.post(endpoint, Object.assign({}, app, {
                "sbg:revisionNotes": revisionNote
            }), {
                headers: new Headers({
                    "session-id": sessionID
                })
            }).map(r => r.json());
        }));
    }

    // private getAllEntries<T>(requestOptions: RequestOptions, mapFn?: (response: Response) => T) {
    //     const pageSize = 100;
    //     const mapper   = mapFn || ((response) => response.json().items);
    //
    //     if (!requestOptions.search) {
    //         requestOptions.search = new URLSearchParams();
    //     }
    //
    //     requestOptions.search.set("limit", pageSize as string);
    //     requestOptions.search.set("offset", "0");
    //
    //     const request = new Request(requestOptions);
    //
    //     return this.http.request(request).flatMap((response: Response) => {
    //         const totalResults = ~~response.headers.get('X-Total-Matching-Query');
    //         let pages          = Math.ceil(totalResults / pageSize) || 1;
    //         const requests     = [];
    //
    //         requests.push(Observable.of(response));
    //
    //         for (let p = 1; p < pages; p++) {
    //             const opts = new RequestOptions(requestOptions);
    //             opts.search.set("offset", pageSize * p);
    //             requests.push(this.http.request(new Request(opts)));
    //         }
    //
    //         return Observable.zip(...requests, (...responses) => [].concat.apply([], responses.map(mapper)))
    //     });
    //
    // }
    //
    // public getProjects(): Observable<PlatformProject[]> {
    //     return this.getAllEntries<PlatformProject[]>(this.baseRequestOptions.merge({
    //         url: this.baseRequestOptions.url + "/projects"
    //     }));
    // }
    //
    // public getApps(): Observable<PlatformApp[]> {
    //     return this.getAllEntries<PlatformApp[]>(this.baseRequestOptions.merge({
    //         url: this.baseRequestOptions.url + "/apps"
    //     }));
    // }
    //
    // public getApp(id): Observable<PlatformAppDetails> {
    //     return this.http.request(new Request(this.baseRequestOptions.merge({
    //         url: this.baseRequestOptions.url + "/apps/" + id
    //     }))).map(response => response.json()) as Observable<PlatformAppDetails>;
    // }
    //
    // public getAppCWL(id): Observable<string> {
    //     return this.http.request(new Request(this.baseRequestOptions.merge({
    //         url: this.baseRequestOptions.url + "/apps/" + id + "/raw"
    //     }))).map(response => response.text());
    // }
}