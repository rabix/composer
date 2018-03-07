import {InjectionToken} from "@angular/core";

export interface AppSaver {
    save: (appID: string, content: string) => Promise<string>;
}

export const AppSaverToken = new InjectionToken("AppSaverToken");
