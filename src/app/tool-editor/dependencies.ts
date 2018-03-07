import {InjectionToken} from "@angular/core";
import {Observable} from "rxjs/Observable";

export const PreviewJobManagerToken = new InjectionToken("toolEditor.previewJobManager");

export interface PreviewJobManager {
    get(appID: string): Observable<any>,

    set(appID: string, job: Object): Promise<any>,
}
