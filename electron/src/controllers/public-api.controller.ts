import request = require("request");
import {Request, RequestResponse} from "request";

interface RequestError {
    code: string;
    errno: string;
    host: string;
    hostname: string;
    message: string;
    port: number;
    syscall: string;
}

export class PublicAPIError extends Error {

    details: any;

    constructor(message?: string) {
        super(message);
    }

    static fromSystemError(err: RequestError) {
        const error   = new PublicAPIError(err.message);
        error.details = err;
        return error;
    }
}

export class PublicAPI {
    url: string;
    token: string;

    static with(url, token) {
        return new PublicAPI(url, token);
    }

    constructor(url, token?: string) {
        this.url   = url;
        this.token = token;
    }

    getUser(callback): Request {
        return request.get(this.url + "/v2/user", {
            timeout: 10001,
            headers: {"X-SBG-Auth-Token": this.token}
        }, (err: RequestError, response: RequestResponse, body) => {

            if (err) {
                return callback(PublicAPIError.fromSystemError(err));
            }

            if (response.statusCode !== 200) {
                return callback(new PublicAPIError(response.statusMessage));
            }

            try {
                callback(null, JSON.parse(body))
            } catch (ex) {
                return callback(new PublicAPIError("Unable to parse the response."));
            }
        });
    }

}
