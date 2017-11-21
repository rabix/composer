import {Injectable, NgZone, Optional} from "@angular/core";
import {AsyncSubject} from "rxjs/AsyncSubject";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {Guid} from "./guid.service";
import {IPC_EOS_MARK} from "../../../electron/src/constants";

enum RequestType {
    Once,
    Watch
}

export type IPCRoute =
    "accelerator"
    | "checkForPlatformUpdates"
    | "createDirectory"
    | "createFile"
    | "createPlatformApp"
    | "deletePath"
    | "fetchPlatformData"
    | "getApps"
    | "getAppUpdates"
    | "getFileOutputInfo"
    | "getLocalFileContent"
    | "getLocalRepository"
    | "getPlatformApp"
    | "getProject"
    | "getProjects"
    | "getSetting"
    | "getUserByToken"
    | "getUserRepository"
    | "hasDataCache"
    | "patchAppMeta"
    | "patchLocalRepository"
    | "patchSwap"
    | "patchUserRepository"
    | "pathExists"
    | "probeExecutorVersion"
    | "putSetting"
    | "readDirectory"
    | "readFileContent"
    | "resolve"
    | "resolveContent"
    | "saveAppRevision"
    | "saveFileContent"
    | "scanPlatforms"
    | "searchLocalProjects"
    | "searchPublicApps"
    | "searchUserProjects"
    | "sendFeedback"
    | "switchActiveUser"
    | "watchAppMeta";

export type IPCListeners =
    "watchLocalRepository" |
    "watchUserRepository" |
    "executeApp" |
    "accelerator" |
    "deepLinkingHandler" |
    "openFileHandler";

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

    constructor(@Optional() private zone: NgZone) {
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

    request(message: IPCRoute, data = {}, zone?: NgZone): Observable<any> {
        const messageID = Guid.generate();

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

    watch(message: IPCListeners, data = {}, zone?: NgZone): Observable<any> {
        // Create a unique ID for the message
        const messageID = Guid.generate();

        // Store the request stream, so we know where to push incoming messages when they arrive
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

        const incomingMessages = this.pendingRequests[messageID].stream;

        const clientObservable = new Observable(observer => {

            // Proxy all messages from the IPC channel to this observable
            const msgSubscription = incomingMessages
            // Complete when the “$$EOS$$” message comes in
                .takeUntil(incomingMessages.filter(v => v === IPC_EOS_MARK))
                .subscribe(observer);


            return () => {
                this.ipcRenderer.send("data-request-terminate", {
                    id: messageID,
                    message: "stop"
                });

                msgSubscription.unsubscribe();
            };
        });

        return clientObservable;
    }
}
