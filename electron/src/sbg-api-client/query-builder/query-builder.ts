import {RequestAPI} from "request";
import * as requestPromise from "request-promise-native";

type APIEndpoint = "user" | "projects" | "apps" | string;

export class QueryBuilder<T> {

    private static MAX_QUERY_LIMIT = 100;

    private params: { limit?: number, offset?: number, fields?: any[] } = {};

    private apiRequest: RequestAPI<any, any, any>;

    constructor(url, token) {

        this.apiRequest = requestPromise.defaults({

            baseUrl: url + "/v2/",
            timeout: 60000,
            json: true,
            headers: {
                "X-SBG-Auth-Token": token
            },

        });
    }

    static create(url: string, token: string) {
        return new QueryBuilder(url, token);
    }

    timeout(timeout: number) {
        this.apiRequest = this.apiRequest.defaults({timeout: timeout});
        return this;
    }

    limit(n: number) {
        this.params.limit = n;
        return this;
    }

    offset(n: number) {
        this.params.offset = n;
        return this;
    }

    fields(...fields: string[]): QueryBuilder<T> {
        this.params.fields = fields;
        return this;
    }

    get(endpoint: APIEndpoint, resolveWithFullResponse = false) {
        return this.apiRequest.defaults({
            qs: this.params,
            resolveWithFullResponse,
        })(endpoint);
    }

    all() {
        throw "Not Implemented";
    }


}
