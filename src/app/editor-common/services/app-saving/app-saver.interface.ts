import {InjectionToken} from "@angular/core";

export interface AppSaver {
    save: (appID: string, content: string) => Promise<string>;
}

export const APP_SAVER_TOKEN = new InjectionToken("APP_SAVER_TOKEN");
