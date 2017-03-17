import {Injectable} from "@angular/core";
import {Headers, Http, URLSearchParams} from "@angular/http";
import {Observable, ReplaySubject} from "rxjs";
import {ENVP} from "../../../config/env.config";
import {SettingsService} from "../../settings/settings.service";
import {PlatformAppEntry, PlatformProjectEntry} from "./platform-api.types";


export interface ServiceConfig {
    port?: number;
    prefix?: string;
}

@Injectable()
export class PlatformAPI {

    sessionID = new ReplaySubject(1);

    private platformServices: { brood: string, watson: string, gatekeeper: string } = {} as any;

    constructor(private http: Http, private settings: SettingsService) {
        this.settings.platformConfiguration.subscribe(config => {

            Object.keys(ENVP.serviceRoutes).forEach(serviceName => {
                this.platformServices[serviceName] = this.getServiceUrl(config.url, serviceName);
            });

            // If we do not reset the session ID upon the connection change,
            // the race condition with other api calls will take the old one
            this.sessionID = new ReplaySubject(1);

            this.checkToken(config.url, config.token).filter(isValid => isValid === true)
                .switchMap(_ => this.http.post(this.platformServices.gatekeeper + "/session/open/auth", {}, {
                    headers: new Headers({
                        "auth-token": config.token
                    })
                })).subscribe(res => this.sessionID.next(res.json().message.session_id));
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

    /**
     * @name PlatformApiService:getProjectApps
     * @param ownerSlug
     * @param projectSlug
     */
    public getProjectApps(ownerSlug: string, projectSlug: string) {
        const endpoint = `/apps/${ownerSlug}/${projectSlug}`;
        return this.sessionID.switchMap(sessionID => this.http.get(this.platformServices.brood + endpoint, {
            search: "_role=minimal",
            headers: new Headers({
                "session-id": sessionID
            })
        })).map(r => r.json().message).first();
    }

    /**
     * @deprecated
     */
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

    public getAppCWL(app, revision?: number) {

        const id = app["sbg:id"].split("/").slice(0, -1).concat(revision).filter(x => x !== undefined).join("/");

        return this.sessionID.switchMap(sessionID => this.http.get(`${this.platformServices.brood}/raw/${id}`, {
            headers: new Headers({
                "session-id": sessionID
            })
            // Platform CWL files don't come with newlines
        })).map(r => {
            return JSON.stringify(r.json(), null, 4);
        });
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
        const appPathChunks = app["sbg:id"].split("/");
        appPathChunks.pop();

        const appPath = appPathChunks.join("/");

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

    public getUpdates(ids: string []) {
        return this.sessionID.switchMap(sessionID =>
            this.http.post(`${this.platformServices.brood}/updates`, ids, {
                headers: new Headers({
                    "session-id": sessionID
                })
            }).map(r => r.json().message).first());
    }

    private objectToParams(obj) {
        const params = new URLSearchParams();
        Object.keys(obj).forEach(key => {
            params.set(key, obj[key]);
        });
        return params;
    }
}
