"use strict";
const request = require("request");
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
class PlatformGateway {
    constructor(url) {
        this.serviceRoutes = {
            brood: "",
            watson: "",
            gatekeeper: ""
        };
        for (let service in this.serviceRoutes) {
            this.serviceRoutes[service] = this.makeServiceURL(url, service);
        }
    }
    makeServiceURL(platformURL, serviceName) {
        const isVayu = platformURL.indexOf("-vayu.sbgenomics.com") !== -1;
        const isStaging = platformURL.indexOf("staging-igor.sbgenomics.com") !== -1;
        let serviceURL = platformURL.replace("igor", serviceName);
        if (isVayu) {
            serviceURL = serviceURL + ":" + serviceConfig[serviceName].port;
        }
        else if (isStaging) {
            serviceURL = serviceURL.replace("staging-igor", `staging-${serviceName}`);
        }
        return [serviceURL, serviceConfig[serviceName].prefix].join("/");
    }
    proxyJsonMessage(callback) {
        return (err, response, body) => {
            if (err) {
                return callback(err);
            }
            if (response.statusCode !== 200) {
                return callback(response);
            }
            try {
                callback(null, JSON.parse(body).message);
            }
            catch (ex) {
                // @todo add reporting
                callback(ex);
            }
        };
    }
    getSessionID(authToken, callback) {
        const gk = this.serviceRoutes.gatekeeper;
        console.log("Checking session ID");
        request.post({
            url: gk + "/session/open/auth",
            headers: {
                "auth-token": authToken
            }
        }, this.proxyJsonMessage((err, message) => {
            if (err) {
                return callback(err);
            }
            if (!message.session_id) {
                return callback(new Error("Missing session ID"));
            }
            console.log("Setting session id", message);
            this.sessionID = message.session_id;
            callback(null, message);
        }));
    }
    getProjects(callback) {
        console.log("Getting projects", this.sessionID);
        request({
            url: this.serviceRoutes.watson + "/projects",
            headers: { "session-id": this.sessionID }
        }, this.proxyJsonMessage(callback));
    }
    getPublicApps(callback) {
        request({
            url: this.serviceRoutes.brood + "/apps?_order_by=label&visibility=public&_role=minimal",
            headers: { "session-id": this.sessionID },
        }, this.proxyJsonMessage(callback));
    }
    getUserApps(projectID, callback) {
        let endpoint = this.serviceRoutes.brood + "/apps?_order_by=label&_role=minimal";
        if (typeof projectID === "string") {
            endpoint = this.serviceRoutes.brood + `/apps/${projectID}?_order_by=label&_role=minimal`;
        }
        else if (typeof projectID === "function") {
            callback = projectID;
        }
        console.log("Getting apps", this.sessionID);
        request({
            url: endpoint,
            headers: { "session-id": this.sessionID },
        }, this.proxyJsonMessage(callback));
    }
    getApp(id, callback) {
        request({
            url: this.serviceRoutes.brood + "/apps/" + id,
            headers: { "session-id": this.sessionID }
        }, this.proxyJsonMessage(callback));
    }
}
exports.PlatformGateway = PlatformGateway;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGxhdGZvcm0uZ2F0ZXdheS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9nYXRld2F5cy9wbGF0Zm9ybS5nYXRld2F5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxtQ0FBbUM7QUFDbkMsTUFBTSxhQUFhLEdBQUc7SUFDbEIsS0FBSyxFQUFFO1FBQ0gsSUFBSSxFQUFFLEtBQUs7UUFDWCxNQUFNLEVBQUUsSUFBSTtLQUNmO0lBQ0QsTUFBTSxFQUFFO1FBQ0osSUFBSSxFQUFFLEtBQUs7UUFDWCxNQUFNLEVBQUUsSUFBSTtLQUNmO0lBQ0QsVUFBVSxFQUFFO1FBQ1IsSUFBSSxFQUFFLEtBQUs7UUFDWCxNQUFNLEVBQUUsSUFBSTtLQUNmO0NBQ0osQ0FBQztBQUVGO0lBVUksWUFBWSxHQUFXO1FBTmYsa0JBQWEsR0FBRztZQUNwQixLQUFLLEVBQUUsRUFBRTtZQUNULE1BQU0sRUFBRSxFQUFFO1lBQ1YsVUFBVSxFQUFFLEVBQUU7U0FDakIsQ0FBQztRQUlFLEdBQUcsQ0FBQyxDQUFDLElBQUksT0FBTyxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDO1lBQ3JDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDcEUsQ0FBQztJQUNMLENBQUM7SUFFTyxjQUFjLENBQUMsV0FBbUIsRUFBRSxXQUFtQjtRQUMzRCxNQUFNLE1BQU0sR0FBTSxXQUFXLENBQUMsT0FBTyxDQUFDLHNCQUFzQixDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDckUsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO1FBRTVFLElBQUksVUFBVSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRTFELEVBQUUsQ0FB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