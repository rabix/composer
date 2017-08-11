import {RequestAPI} from "request";
import * as requestPromise from "request-promise-native";

export class GitHubClient {

    private apiRequest: RequestAPI<any, any, any>;

    constructor() {
        this.apiRequest = requestPromise.defaults({

            baseUrl: "https://api.github.com/repos/rabix/composer",
            timeout: 60000,
            json: true,
            headers: {
                "User-Agent": "Rabix Composer",
                "Content-Type": "application/json"
            },
        });
    }

    releases() {
        return {
            get: () => this.apiRequest("releases")
        }
    }
}
