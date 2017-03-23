import {Injectable} from "@angular/core";
import {Headers, Http, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
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

    private platformServices: { brood: string, voyager: string, watson: string, gatekeeper: string } = {} as any;

    private userInfo: { email: string, id: string, staff: boolean, username: string } = {} as any;

    constructor(private http: Http, private settings: SettingsService) {

        this.settings.platformConfiguration.subscribe(config => {

            Object.keys(ENVP.serviceRoutes).forEach(serviceName => {
                this.platformServices[serviceName] = PlatformAPI.getServiceUrl(config.url, serviceName);
            });

            // If we do not reset the session ID upon the connection change,
            // the race condition with other api calls will take the old one
            this.sessionID = new ReplaySubject(1);

            this.checkToken(config.url, config.token).filter(isValid => isValid === true)
                .switchMap(_ => this.http.post(this.platformServices.gatekeeper + "/session/open/auth", {}, {
                    headers: new Headers({
                        "auth-token": config.token
                    })
                }))
                .subscribe(res => {
                    this.sessionID.next(res.json().message.session_id);

                    this.getUserInfo().subscribe((user) => this.userInfo = user);
                }
            )
            ;
        });
    }


    public checkToken(platform: string, token: string) {
        const url = PlatformAPI.getServiceUrl(platform, "gatekeeper");

        return this.http.get(url + "/auth_token/check", {
            headers: new Headers({
                "auth-token": token
            })
        }).catch(res => Observable.of(res)).map(res => {

            if (res.status === 0) {
                this.settings.validity.next(false);
                return "invalid_platform";
            }

            this.settings.validity.next(res.ok);
            return res.ok;
        });
    }

    static getServiceUrl(platformUrl: string, serviceName: string) {
        const isVayu = platformUrl.indexOf("-vayu.sbgenomics.com") !== -1;
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
            const endpoint = `${this.platformServices.brood}/apps/${appPath}/${nextRevision}`;

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

    public getUserInfo() {
        return this.sessionID.switchMap(sessionID =>
            this.http.get(`${this.platformServices.gatekeeper}/user/`, {
                headers: new Headers({
                    "session-id": sessionID
                })
            }).map(r => r.json().message).first());
    }

    public sendFeedback(type: string, message: string) {
        return this.settings.platformConfiguration.take(1).switchMap((conf) => {
                const data = {
                    "id": "user.feedback",
                    "data": {
                        "user": this.userInfo.id,
                        "referrer": "Cottontail " + conf.url,
                        "user_agent": process.platform,
                        "timestamp": this.getFormatedCurrentTimeStamp(),
                        "text": message,
                        "type": type,

                    }
                };
                return this.sessionID.switchMap(sessionID =>
                    this.http.post(`${this.platformServices.voyager}/send/`, data, {
                        headers: new Headers({
                            "session-id": sessionID
                        })
                    }).map(r => r.json().message).first());
            }
        );
    }

    // FIXME should not be here but currently here is the only place where it is used
    private getFormatedCurrentTimeStamp() {
        const date = new Date();
        const pad = (n) => (n < 10 ? "0" : "") + n;

        // format is YYYYMMDDHHMMSS
        return date.getFullYear() +
            pad(date.getMonth() + 1) +
            pad(date.getDate()) +
            pad(date.getHours()) +
            pad(date.getMinutes()) +
            pad(date.getSeconds());
    }

    private objectToParams(obj) {
        const params = new URLSearchParams();
        Object.keys(obj).forEach(key => {
            params.set(key, obj[key]);
        });
        return params;
    }
}
