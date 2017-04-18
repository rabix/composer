import {ServiceConfig} from "../services/api/platforms/platform-api.service";
// declare const ENV_PARAMS;

export const ENVP: {
    serviceRoutes: {
        brood: ServiceConfig,
        voyager: ServiceConfig,
        watson: ServiceConfig,
        gatekeeper: ServiceConfig
    }
} = {
    "serviceRoutes": {
        "brood": {
            "port": 11180,
            "prefix": "v1"
        },
        "voyager": {
            "port": 22688,
            "prefix": "v0"
        },
        "watson": {
            "port": 21555,
            "prefix": "v1"
        },
        "gatekeeper": {
            "port": 27778,
            "prefix": "v1"
        }
    }
};
