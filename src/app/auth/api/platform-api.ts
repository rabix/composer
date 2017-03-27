import {Headers, Http} from "@angular/http";
import {ENVP} from "app/config/env.config";
import {Observable} from "rxjs/Observable";
import {PlatformProjectEntry} from "../../core/data-gateway/data-types/platform-api.types";
import {PlatformAppEntry} from "../../services/api/platforms/platform-api.types";

export class PlatformAPI {

    static getServiceURL(platformUrl: string, serviceName: string) {
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

    constructor(private http: Http, private url?: string, private token?: string, private sessionID?: string) {

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
        }).map(response => response.json().message.session_id);
    }


    public getRabixProjects(): Observable<PlatformProjectEntry[]> {
        return this.http.get(this.getServiceURL("watson") + "/projects", {
            search: "_role=minimal&is_rabix=true",
            headers: new Headers({
                "session-id": this.sessionID
            })
        }).map(r => r.json().message);
    }

    public getProjectApps(ownerSlug: string, projectSlug: string) {
        const endpoint = `/apps/${ownerSlug}/${projectSlug}`;
        return this.http.get(this.getServiceURL("brood") + endpoint, {
            search: "_role=minimal",
            headers: new Headers({
                "session-id": this.sessionID
            })
        }).map(r => r.json().message);
    }


    public getApp(id: string);
    public getApp(username: string, projectSlug: string, appSlug: string, revision: number | string);
    public getApp(...args: any[]) {
        let id = args[0];
        if (args.length === 4) {
            id = args.join("/");
        }

        return this.http.get(this.getServiceURL("brood") + `/apps/${id}`, {
            headers: new Headers({
                "session-id": this.sessionID
            })
        }).map(r => r.json().message);
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

            return this.http.post(endpoint, Object.assign({}, app, {
                "sbg:revisionNotes": revisionNote
            }), {
                headers: new Headers({
                    "session-id": this.sessionID
                })
            }).map(r => r.json());
        });
    }

    getPublicApps() {
        return this.http.get(this.getServiceURL("brood") + "/apps", {
            search: "_order_by=label&visibility=public",
            headers: new Headers({
                "session-id": this.sessionID
            })
        }).map(r => r.json().message);
    }

}
