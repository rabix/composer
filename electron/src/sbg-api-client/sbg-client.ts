import {IncomingMessage} from "http";
import {reject} from "q";
import {RequestAPI} from "request";
import * as requestPromise from "request-promise-native";
import {RequestError, StatusCodeError, TransformError} from "request-promise-native/errors";
import {Project, User} from "./interfaces";
import {App} from "./interfaces/app";
import {AppQueryParams, QueryParams} from "./interfaces/queries";

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

    constructor(url: string, token: string) {

        this.apiRequest = requestPromise.defaults({

            baseUrl: url + "/v2/",
            timeout: 300000,
            json: true,
            headers: {
                "X-SBG-Auth-Token": token,
                "Content-Type": "application/json"
            },
        });
    }

    getUser(): SBGClientResponse<User> {
        return this.apiRequest("user", {
            timeout: 30000
        });
    }

    getAllProjects(): Promise<Project[]> {
        return this.fetchAll<Project>("projects?fields=_all")
            .then((projects: Project[]) => {
                return projects.filter(project => project.type === "v2")
            });
    }

    /**
     * @deprecated use {@link getUser}
     */
    get user() {
        return {
            get: (): SBGClientResponse<User> => this.getUser()
        };
    }


    /**
     * @deprecated use {@link getAllProjects}
     */
    get projects() {
        return {
            all: () => this.getAllProjects()
        }
    }

    getAllUserApps(query: AppQueryParams = {fields: "id,name,project,raw.class,revision"}) {
        return this.fetchAll<App>("apps", query);
    }

    getApp(appID: string) {
        return this.apiRequest(`apps/${appID}`.toLowerCase());
    }

    getAllPublicApps(query: AppQueryParams = {
        visibility: "public",
        fields: [
            "id",
            "name",
            "project",
            "revision",
            "raw.class",
            "raw.sbg:blackbox",
            "raw.sbg:categories",
            "raw.sbg:toolkit",
            "raw.sbg:toolkitVersion"
        ].join(",")
    }) {
        return this.fetchAll<App>("apps", query);
    }

    saveAppRevision(appID: string, content: string) {
        const revisionlessID = appID.split("/").slice(0, 3).join("/").toLowerCase();

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
        const revisionlessID = appID.split("/").slice(0, 3).join("/").toLowerCase();

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
            /** @deprecated use {@link getAllUserApps} */
            private: (query: AppQueryParams = {fields: "id,name,project,raw.class,revision"}) => this.getAllUserApps(query),
            /** @deprecated use {@link getApp} */
            get: (appID: string) => this.getApp(appID),
            /** @deprecated use {@link getAllPublicApps} */
            public: (query: AppQueryParams = {
                visibility: "public",
                fields: [
                    "id",
                    "name",
                    "project",
                    "revision",
                    "raw.class",
                    "raw.sbg:blackbox",
                    "raw.sbg:categories",
                    "raw.sbg:toolkit",
                    "raw.sbg:toolkitVersion"
                ].join(",")
            }) => this.getAllPublicApps(),

            /** @deprecated {@link use saveAppRevision} */
            save: (appID, content) => this.saveAppRevision(appID, content),

            /** @deprecated {@link use createApp} */
            create: (appID, content) => this.createApp(appID, content)
        }
    }

    private fetchAll<T>(endpoint: string, qs?: QueryParams): SBGClientResponse<T[]> {
        const load = (offset = 0) => this.apiRequest.defaults({

            qs: {...qs, offset, limit: SBGClient.MAX_QUERY_LIMIT},
            useQuerystring: true,
            resolveWithFullResponse: true,
            qsStringifyOptions: {
                arrayFormat: "repeat"
            }
        })(endpoint);

        return new Promise((resolve, reject) => {

            load().then((result: IncomingMessage & { body: any }) => {
                const total = Number(result.headers["x-total-matching-query"]);
                const items = result.body.items;

                if (items.length === total) {
                    return resolve(items);
                }

                const allItems: any[]     = items;
                const additionalCallCount = Math.ceil(total / SBGClient.MAX_QUERY_LIMIT) - 1;
                const additionalCalls     = [];

                for (let i = 1; i <= additionalCallCount; i++) {
                    additionalCalls.push(load(i * SBGClient.MAX_QUERY_LIMIT));
                }

                return Promise.all(additionalCalls).then(results => {
                    resolve(allItems.concat(...results.map(r => r.body.items)));
                }, reject);
            }, reject);
        });
    }

    sendFeedback(type: string, text: string, referrer: string) {
        return this.apiRequest.post("action/notifications/feedback", {body: {type, text, referrer}, json: true});
    }
}
