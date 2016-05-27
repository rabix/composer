import {OpaqueToken} from "@angular/core";

export interface AppConfig {
    hostname?: string;
    port?: number;
    protocol?: string;
}

declare var APP_ENV_CONFIG;

export const CONFIG: AppConfig = APP_ENV_CONFIG;

export let APP_CONFIG = new OpaqueToken("app.config");
