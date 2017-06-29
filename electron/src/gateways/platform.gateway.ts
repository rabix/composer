import * as request from "request";
const serviceConfig = {
    brood: {
        port: 11180,
        prefix: "v1"
    },
    watson: {
        port: 21555,
        prefix: "v1"
    },
    gatekeeper: {
        port: 27778,
        prefix: "v1"
    }
};

export class PlatformGateway {

    sessionID: string;

    private serviceRoutes = {
        brood: "",
        watson: "",
        gatekeeper: ""
    };

    constructor(url: string) {

        for (let service in this.serviceRoutes) {
            this.serviceRoutes[service] = this.makeServiceURL(url, service);
        }
    }

    private makeServiceURL(platformURL: string, serviceName: string) {
        const isVayu    = platformURL.indexOf("-vayu.sbgenomics.com") !== -1;
        const isStaging = platformURL.indexOf("staging-igor.sbgenomics.com") !== -1;

        let serviceURL = platformURL.replace("igor", serviceName);

        if (isVayu) {
            serviceURL = serviceURL + ":" + serviceConfig[serviceName].port;
        } else if (isStaging) {
            serviceURL = serviceURL.replace("staging-igor", `staging-${serviceName}`);
        }

        return [serviceURL, serviceConfig[serviceName].prefix].join("/");
    }

    private proxyJsonMessage(callback: (err, result?) => void) {
        return (err, response: request.RequestResponse, body: string) => {
            if (err) {
                return callback(err);
            }

            if (response.statusCode !== 200) {
                return callback(response);
            }

            try {
                callback(null, JSON.parse(body).message);
            } catch (ex) {
                // @todo add reporting
                callback(ex);
            }

        }
    }

    getSessionID(authToken: string, callback) {
        const gk = this.serviceRoutes.gatekeeper;

        request.post({
            url: gk + "/session/open/auth",
            headers: {
                "auth-token": authToken
            }
        }, this.proxyJsonMessage((err, message?) => {
            if (err) {
                return callback(err);
            }

            if (!message.session_id) {
                return callback(new Error("Missing session ID"));
            }

            this.sessionID = message.session_id;
            callback(null, message);
        }));
    }

    getProjects(callback) {
        request({
            url: this.serviceRoutes.watson + "/projects",
            headers: {"session-id": this.sessionID}
        }, this.proxyJsonMessage(callback));
    }


    getPublicApps(callback) {
        request({
            url: this.serviceRoutes.brood + "/apps?_order_by=label&visibility=public&_role=minimal",
            headers: {"session-id": this.sessionID},
        }, this.proxyJsonMessage(callback));
    }

    /**
     * projectID goes in the format "owner-slug/project-slug"
     * @param callback
     */
    getUserApps(callback);
    getUserApps(projectID: string, callback);
    getUserApps(projectID?: any, callback?: any) {
        let endpoint = this.serviceRoutes.brood + "/apps?_order_by=label&_role=minimal";

        if (typeof projectID === "string") {
            endpoint = this.serviceRoutes.brood + `/apps/${projectID}?_order_by=label&_role=minimal`
        } else if (typeof projectID === "function") {
            callback = projectID;
        }

        request({
            url: endpoint,
            headers: {"session-id": this.sessionID},
        }, this.proxyJsonMessage(callback));
    }

    getApp(id, callback) {
        request({
            url: this.serviceRoutes.brood + "/apps/" + id,
            headers: {"session-id": this.sessionID}
        }, this.proxyJsonMessage(callback))
    }


}
