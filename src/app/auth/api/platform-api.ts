import {Headers, Http} from "@angular/http";
import {ENVP} from "app/config/env.config";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {PlatformProjectEntry} from "../../core/data-gateway/data-types/platform-api.types";
import {PlatformAppEntry} from "../../services/api/platforms/platform-api.types";

export class PlatformAPI {

    readonly sessionID = new ReplaySubject<string>(1);

    static getServiceURL(platformUrl: string, serviceName: string) {
        const isVayu    = platformUrl.indexOf("-vayu.sbgenomics.com") !== -1;
        const isStaging = platformUrl.indexOf("staging-igor.sbgenomics.com") !== -1;
        const isCGC     = platformUrl.indexOf("cgc.sbgenomics.com") !== -1;

        let serviceUrl = platformUrl.replace("igor", serviceName);

        if (isVayu) {
            serviceUrl = serviceUrl + ":" + ENVP.serviceRoutes[serviceName].port;
        } else if (isStaging) {
            serviceUrl = serviceUrl.replace("staging-igor", `staging-${serviceName}`);
        } else if (isCGC) {
            serviceUrl = serviceUrl.replace("cgc", `cgc-${serviceName}`);
        }

        return [serviceUrl, ENVP.serviceRoutes[serviceName].prefix].join("/");
    }

    constructor(private http: Http, private url?: string, private token?: string, sessionID?: string) {
        if (sessionID && sessionID.length) {
            this.setSessionID(sessionID);
        }
    }

    setSessionID(sessionID: string) {
        if (!sessionID) {
            return;
        }
        this.sessionID.next(sessionID);
    }

    getServiceURL(service: string): string {
        return PlatformAPI.getServiceURL(this.url, service);
    }

    checkToken() {
        const gatekeeper = PlatformAPI.getServiceURL(this.url, "gatekeeper");
        return this.http.get(gatekeeper + "/auth_token/check", {
            headers: new Headers({
                "auth-token": this.token
            })
        });
    }

    openSession() {
        const gatekeeper = this.getServiceURL("gatekeeper");
        return this.http.post(gatekeeper + "/session/open/auth", {}, {
            headers: new Headers({
                "auth-token": this.token
            })
        }).map(response => response.json().message.session_id)
            .do(sessionID => {
                this.setSessionID(sessionID);
            });
    }


    public getRabixProjects(): Observable<PlatformProjectEntry[]> {
        return this.sessionID.flatMap(sessionID => this.http.get(this.getServiceURL("watson") + "/projects", {
            search: "_role=minimal&is_rabix=true",
            headers: new Headers({
                "session-id": sessionID
            })
        })).map(r => r.json().message);
    }

    public getProjectApps(ownerSlug: string, projectSlug: string) {
        const endpoint = `/apps/${ownerSlug}/${projectSlug}`;
        return this.sessionID.flatMap(sessionID => this.http.get(this.getServiceURL("brood") + endpoint, {
            search: "_role=minimal",
            headers: new Headers({
                "session-id": sessionID
            })
        })).map(r => r.json().message);
    }


    public getApp(id: string);
    public getApp(username: string, projectSlug: string, appSlug: string, revision?: number | string);
    public getApp(...args: any[]) {
        let id = args[0];
        if (args.length > 1) {
            id = args.join("/");
        }

        return this.sessionID.flatMap(sessionID => this.http.get(this.getServiceURL("brood") + `/apps/${id}`, {
            headers: new Headers({
                "session-id": sessionID
            })
        })).map(r => r.json().message);
    }

    public saveApp(app: PlatformAppEntry, revisionNote: string) {

        // Take the App id without the revision id
        const appPathChunks = app["sbg:id"].split("/");
        appPathChunks.pop();

        const appPath = appPathChunks.join("/");

        // Checkout the newest version of this App to get the latest revision
        return this.getApp(appPath).flatMap(latestApp => {
            const nextRevision = (latestApp["sbg:latestRevision"] || 0) + 1;
            const endpoint     = this.getServiceURL("brood") + `/apps/${appPath}/${nextRevision}`;

            return this.sessionID.flatMap(sessionID => this.http.post(endpoint, Object.assign({}, app, {
                "sbg:revisionNotes": revisionNote
            }), {
                headers: new Headers({
                    "session-id": sessionID
                })
            })).map(r => r.json());
        });
    }

    getPublicApps() {
        return this.sessionID.flatMap(sessionID => this.http.get(this.getServiceURL("brood") + "/apps", {
            search: "_order_by=label&visibility=public",
            headers: new Headers({
                "session-id": sessionID
            })
        })).map(r => r.json().message);
    }

    public sendFeedback(userID: string, type: string, message: string, referrerURL?: string) {

        const getFormatedCurrentTimeStamp = () => {
            const date = new Date();
            const pad  = (n) => (n < 10 ? "0" : "") + n;

            // format is YYYYMMDDHHMMSS
            return date.getFullYear() +
                pad(date.getMonth() + 1) +
                pad(date.getDate()) +
                pad(date.getHours()) +
                pad(date.getMinutes()) +
                pad(date.getSeconds());
        };

        const data = {
            "id": "user.feedback",
            "data": {
                "user": userID,
                "referrer": "Cottontail " + referrerURL,
                "user_agent": window.navigator.userAgent,
                "timestamp": getFormatedCurrentTimeStamp(),
                "text": message,
                "type": type,
            }
        };

        return this.sessionID.flatMap(sessionID => this.http.post(this.getServiceURL("voyager") + "/send", data, {
            headers: new Headers({
                "session-id": sessionID
            })
        })).map(r => r.json().message);
    }

    getUser(sessionID) {
        if (sessionID) {
            return this.http.get(this.getServiceURL("gatekeeper") + "/user", {
                headers: new Headers({
                    "session-id": sessionID || this.sessionID
                })
            }).map(r => r.json().message);
        }

        return this.sessionID.flatMap(sessionID => this.http.get(this.getServiceURL("gatekeeper") + "/user", {
            headers: new Headers({
                "session-id": sessionID
            })
        })).map(r => r.json().message);


    }

    searchUserProjects(query: string, limit = 20): Observable<PlatformAppEntry[]> {
        return this.sessionID.flatMap(sessionID =>
            this.http.get(this.getServiceURL("brood") + `/apps?_role=minimal&visibility=mine&_limit=${limit}&q=${query}`, {
                headers: new Headers({
                    "session-id": sessionID
                })
            })).map(r => r.json().message);
    }

    suggestSlug(owner, project, slug): Observable<{ app_name: string, rev: number }> {
        return this.sessionID.flatMap(sessionID =>
            this.http.post(this.getServiceURL("brood") + `/apps/${owner}/${project}/suggest-slug`, {
                label: slug
            }, {
                headers: new Headers({
                    "session-id": sessionID
                })
            })).map(r => r.json().message);
    }

    createApp(owner, project, name, appPayload): Observable<PlatformAppEntry> {
        return this.sessionID.flatMap(sessionID =>
            this.http.post(this.getServiceURL("brood") + `/apps/${owner}/${project}/${name}`, appPayload, {
                headers: new Headers({
                    "session-id": sessionID
                })
            })).map(r => r.json().message);
    }

}
