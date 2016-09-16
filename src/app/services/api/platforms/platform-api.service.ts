import {Injectable} from "@angular/core";
import {Http, Headers} from "@angular/http";
import {ENVP} from "../../../config/env.config";

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

@Injectable()
export class PlatformAPI {

    private sessionID = ENVP.user.sessionId;

    private platformServices = ENVP.apiUrls;

    constructor(private http: Http) {
        this.platformServices = Object.keys(ENVP.apiUrls).reduce((acc, key) => {
            return Object.assign(acc, {[key]: ENVP.apiUrls[key].replace(/\/$/, "")})
        }, {}) as any;

    }

    public getApps() {
        return this.http.get(this.platformServices.brood + "/apps", {
            search: "_role=minimal",
            headers: new Headers({
                "session-id": this.sessionID
            })
        }).map(r => r.json().message);
    }

    public getOwnProjects() {
        return this.http.get(this.platformServices.watson + "/projects", {
            search: "_role=minimal&is_rabix=true",
            headers: new Headers({
                "session-id": this.sessionID
            })
        }).map(r => r.json().message.map(project => Object.assign(project, {
            path: `${project.created_by_username}/${project.slug}`
        })));
    }

    public getAppCWL(app) {

        return this.http.get(`${this.platformServices.brood}/raw/${app["sbg:id"]}`, {
            headers: new Headers({
                "session-id": this.sessionID
            })
            // Platform CWL files don't come with newlines
        }).map(r => JSON.stringify(r.json(), null, 4));
    }

    public getPublicApps() {
        return this.http.get(`${this.platformServices.brood}/apps`, {
            search: "_order_by=label&visibility=public",
            headers: new Headers({
                "session-id": this.sessionID
            })
        }).map(r => r.json().message);
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
    //     return this.http.request(request).switchMap((response: Response) => {
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