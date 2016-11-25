import {Injectable, NgZone} from "@angular/core";
import {GuidService} from "./guid.service";
import {AsyncSubject, Subject} from "rxjs";

const {ipcRenderer} = window.require("electron");

enum RequestType {
    Once,
    Watch
}

@Injectable()
export class IpcService {

    private pendingRequests: {
        [id: string]: {
            type: RequestType,
            stream: Subject<any>
        }
    } = {};

    constructor(private guid: GuidService, private zone: NgZone) {

        ipcRenderer.on("data-reply", (sender, response) => {

            this.zone.run(() => {
                console.debug("Data reply received", response.id, response);

                const {stream, type} = this.pendingRequests[response.id];

                if (response.error) {
                    stream.error(response.error);
                }
                stream.next(response.data);

                if (type === RequestType.Once) {
                    stream.complete();
                    delete this.pendingRequests[response.id];
                }
            });

        });
    }

    public request(message: string, data = {}) {

        const messageID = this.guid.generate();

        this.pendingRequests[messageID] = {
            type: RequestType.Once,
            stream: new AsyncSubject<any>()
        };

        console.trace("Sending", message, "(", messageID, ")", data);

        ipcRenderer.send("data-request", {
            id: messageID,
            message,
            data
        });
        return this.pendingRequests[messageID].stream;
    }

    public watch(message: string, data = {}) {

        const messageID = this.guid.generate();

        this.pendingRequests[messageID] = {
            type: RequestType.Watch,
            stream: new Subject<any>()
        };

        console.trace("Watching", message, "(", messageID, ")", data);

        ipcRenderer.send("data-request", {
            id: messageID,
            message,
            data
        });

        return this.pendingRequests[messageID].stream;
    }
}