import * as requestPromise from "request-promise-native";

const apiRequest = requestPromise.defaults({

    baseUrl: "https://api.github.com/repos/rabix/composer",
    timeout: 60000,
    json: true,
    headers: {
        "User-Agent": "Rabix Composer",
        "Content-Type": "application/json"
    },
});

export function getReleases() {
    return apiRequest("releases");
}
