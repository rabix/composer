import * as os from "os";
import {app} from "electron";
import {IncomingMessage} from "http";
import {reject} from "q";
import {RequestAPI} from "request";
import * as requestPromise from "request-promise-native";
import {RequestError, StatusCodeError, TransformError} from "request-promise-native/errors";
import {Project, User} from "./interfaces";
import {App} from "./interfaces/app";
import {AppQueryParams, QueryParams} from "./interfaces/queries";
import {ProxySettings} from "../storage/types/proxy-settings";

export interface SBGClientPromise<T, K> {
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = K>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
}

export type SBGClientResponse<T> = SBGClientPromise<T, RequestError | StatusCodeError | TransformError>;

export class SBGClient {

    private apiRequest: RequestAPI<any, any, any>;

    private static MAX_QUERY_LIMIT = 100;

    static create(url: string, token: string): SBGClient {
        return new SBGClient(url, token);
    }

    constructor(url: string, token: string, proxySettings?: ProxySettings) {

        const options: any = {
            baseUrl: url + "/v2/",
            timeout: 300000,
            json: true,
            headers: {
                "X-SBG-Auth-Token": token,
                "Content-Type": "application/json",
                "User-Agent": `Rabix Composer ${app.getVersion()} (${os.type()} ${os.release()})`
            },
        };

        if (proxySettings && proxySettings.useProxy) {
            options.proxy = proxySettings.server + (proxySettings.port ? `:${proxySettings.port}` : "");

            if (proxySettings.useAuth) {
                const username = proxySettings.username;
                const password = proxySettings.password;
                options.headers["Proxy-Authorization"] =
                    `Basic ${new Buffer(username + ":" + password).toString('base64')}`
            }
        }

        this.apiRequest = requestPromise.defaults(options);
    }

    getUser(): SBGClientResponse<User> {
        return this.apiRequest("user", {
            timeout: 30000
        });
    }

    getProject(projectSlug: string): Promise<Project> {
        return this.apiRequest(`projects/${projectSlug}`);
    }

    getProjects(): Promise<Project[]> {
        return this.apiRequest.get("projects?fields=_all")
            .then(projects => projects.items)
    }

    searchProjects(name: string): Promise<Project[]> {
        return this.apiRequest.get("projects", {
            qs: {name: name, fields: "_all"}
        }).then(res => res.items);
    }

    /**
     * @deprecated use {@link getUser}
     */
    get user() {
        return {
            get: (): SBGClientResponse<User> => this.getUser()
        };
    }

    getUserApps(projectId: string, query: AppQueryParams = {fields: "id,name,project,class,revision,label"}) {
        return this.getUserAppsForProjects([projectId], query);
    }

    getUserAppsForProjects(projectIds: string[], query: AppQueryParams = {fields: "id,name,project,class,revision,label"}) {
        const load = (offset: number) => this.apiRequest.post("action/internal/app_containers", {
            qs: {...query, offset, limit: SBGClient.MAX_QUERY_LIMIT},
            resolveWithFullResponse: true,
            body: {
                projects: projectIds
            }
        });

        return this.fetchAllSequentially<App>(load);
    }

    getAppUpdates(appSlugs: string[], query: AppQueryParams = {fields: "id,revision,name"}) {
        const load = (offset: number) => this.apiRequest.post("action/internal/app_containers", {
            qs: {...query, offset, limit: SBGClient.MAX_QUERY_LIMIT},
            resolveWithFullResponse: true,
            body: {
                apps: appSlugs
            }
        });

        return this.fetchAllSequentially<App>(load);
    }

    getApp(appID: string) {
        return this.apiRequest(`apps/${appID}`);
    }

    getAllPublicApps(query: AppQueryParams = {
        visibility: "public",
        fields: [
            "id",
            "name",
            "label",
            "project",
            "revision",
            "class",
            "sbg:blackbox",
            "sbg:categories",
            "sbg:toolkit",
            "sbg:toolkitVersion"
        ].join(",")
    }) {
        const load = (offset: number) => this.apiRequest.get("action/internal/app_containers", {
            qs: {...query, offset, limit: SBGClient.MAX_QUERY_LIMIT},
            resolveWithFullResponse: true
        });

        return this.fetchAllSequentially<App>(load);
    }

    saveAppRevision(appID: string, content: string) {
        const revisionlessID = appID.split("/").slice(0, 3).join("/");

        return this.apiRequest(`apps/${revisionlessID}`, {
            fields: "revision"
        }).then(app => {

            const nextRevision = app.revision + 1;
            const url          = `apps/${revisionlessID}/${nextRevision}/raw`;

            return this.apiRequest.post(url, {
                body: content,
                json: false
            });

        });
    }

    createApp(appID: string, content: string): Promise<string> {
        const revisionlessID = appID.split("/").slice(0, 3).join("/");

        return this.apiRequest(`apps/${revisionlessID}`).then((app) => {
            throw new Error("App already exists.");
        }, err => {
            if (err.error && err.error.status == 404) {
                return Promise.resolve();
            }
            throw err;
        }).then(() => {
            const url = `apps/${revisionlessID}/0/raw`;

            return this.apiRequest.post(url, {
                body: content,
                json: false
            });
        });
    }

    get apps() {
        return {
            /** @deprecated use {@link getApp} */
            get: (appID: string) => this.getApp(appID),
            /** @deprecated use {@link getAllPublicApps} */
            public: (query: AppQueryParams = {
                visibility: "public",
                fields: [
                    "id",
                    "name",
                    "label",
                    "project",
                    "revision",
                    "class",
                    "sbg:blackbox",
                    "sbg:categories",
                    "sbg:toolkit",
                    "sbg:toolkitVersion"
                ].join(",")
            }) => this.getAllPublicApps(),

            /** @deprecated {@link use saveAppRevision} */
            save: (appID, content) => this.saveAppRevision(appID, content),

            /** @deprecated {@link use createApp} */
            create: (appID, content) => this.createApp(appID, content)
        }
    }

    private fetchAllSequentially<T>(load: (offset: number) => Promise<any>): SBGClientResponse<T[]> {
        return new Promise<T[]>((resolve, reject) => {

            load(0).then((result: IncomingMessage & { body: any }) => {
                const total = Number(result.headers["x-total-matching-query"]);
                const items: T[] = result.body.items;

                if (items.length === total) {
                    return resolve(items);
                }

                const additionalCallCount = Math.ceil(total / SBGClient.MAX_QUERY_LIMIT) - 1;
                const additionalCalls: Array<() => Promise<any>> = [];

                for (let i = 1; i <= additionalCallCount; i++) {
                    additionalCalls.push(() => load(i * SBGClient.MAX_QUERY_LIMIT));
                }

                const sequence = additionalCalls.reduce((chain, call) => {
                    return chain.then(chainResult => {
                        return call().then(callResult => [...chainResult, callResult])
                    })
                }, Promise.resolve([]));

                sequence.then(results => {
                    resolve(items.concat(...results.map(r => r.body.items)));
                });
            }, reject);
        });
    }

    sendFeedback(type: string, text: string, referrer: string) {
        return this.apiRequest.post("action/notifications/feedback", {body: {type, text, referrer}, json: true});
    }
}
