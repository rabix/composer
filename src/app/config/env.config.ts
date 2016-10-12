import {ServiceConfig} from "../services/api/platforms/platform-api.service";
declare const ENV_PARAMS;

export const ENVP: {
    serviceRoutes: {
        brood: ServiceConfig,
        watson: ServiceConfig,
        gatekeeper: ServiceConfig
    }
} = ENV_PARAMS;
