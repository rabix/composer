import {Injectable, NgZone, Optional} from "@angular/core";
import {AsyncSubject} from "rxjs/AsyncSubject";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {GuidService} from "./guid.service";

enum RequestType {
    Once,
    Watch
}

export type IPCRoute =
    "accelerator"
    | "createDirectory"
    | "createFile"
    | "createPlatformApp"
    | "deletePath"
    | "fetchPlatformData"
    | "patchSwap"
    | "getPlatformApp"
    | "getApps"
    | "getAppUpdates"
    | "getLocalRepository"
    | "getProjects"
    | "getSetting"
    | "getUserByToken"
    | "getUserRepository"
    | "getLocalFileContent"
    | "hasDataCache"
    | "saveAppRevision"
    | "patchLocalRepository"
    | "patchUserRepository"
    | "sendFeedback"
    | "pathExists"
    | "putSetting"
    | "readDirectory"
    | "readFileContent"
    | "resolve"
    | "resolveContent"
    | "scanPlatforms"
    | "searchLocalProjects"
    | "searchPublicApps"
    | "searchUserProjects"
    | "switchActiveUser"
    | "saveFileContent";

export type IPCListeners =
    "watchLocalRepository" |
    "watchUserRepository" |
    "accelerator";

@Injectable()
export class IpcService {

    private ipcRenderer = window["require"]("electron").ipcRenderer;
    private pendingRequests: {
        [id: string]: {
            type: RequestType,
            stream: Subject<any>,
            zone?: NgZone
        }
    }                   = {};

    constructor(private guid: GuidService, @Optional() private zone: NgZone) {
        this.ipcRenderer.on("data-reply", (sender, response) => {

            // console.debug("Data reply received", response.id, response);

            if (!this.pendingRequests[response.id]) {
                // console.warn("Missing ipc request stream", response.id);
                return;
            }
            const {stream, type, zone} = this.pendingRequests[response.id];


            const action = () => {
                if (response.error) {
                    console.warn("Error on IPC Channel:", response.error, response.id);
                    stream.error(response.error);
                }

                stream.next(response.data);

                if (type === RequestType.Once) {
                    stream.complete();
                    delete this.pendingRequests[response.id];
                }
            };

            if (zone) {
                zone.run(() => action());
            } else if (this.zone) {
                this.zone.run(() => action());
            } else {
                action();
            }
        });
    }

    public request(message: IPCRoute, data = {}, zone?: NgZone): Observable<any> {
        const messageID = this.guid.generate();

        this.pendingRequests[messageID] = {
            zone,
            type: RequestType.Once,
            stream: new AsyncSubject<any>(),
        };

        // console.debug("Sending", message, "(", messageID, ")", data);

        this.ipcRenderer.send("data-request", {
            id: messageID,
            watch: false,
            message,
            data
        });
        return this.pendingRequests[messageID].stream;
    }

    public watch(message: IPCListeners, data = {}, zone?: NgZone): Observable<any> {
        const messageID = this.guid.generate();

        this.pendingRequests[messageID] = {
            zone,
            type: RequestType.Watch,
            stream: new Subject<any>()
        };

        this.ipcRenderer.send("data-request", {
            id: messageID,
            watch: true,
            message,
            data
        });

        return this.pendingRequests[messageID].stream;
    }

    public notify(message: any): void {
        this.ipcRenderer.send("notification", {message});
    }
}
