import {Injectable, NgZone, Optional} from "@angular/core";
import {GuidService} from "./guid.service";
import {AsyncSubject, Subject} from "rxjs";

const {ipcRenderer} = window["require"]("electron");

enum RequestType {
    Once,
    Watch
}

@Injectable()
export class IpcService {

    private pendingRequests: {
        [id: string]: {
            type: RequestType,
            stream: Subject<any>,
            zone?: NgZone
        }
    } = {};

    constructor(private guid: GuidService, @Optional() private zone: NgZone) {
        ipcRenderer.on("data-reply", (sender, response) => {

            console.debug("Data reply received", response.id, response);

            const {stream, type, zone} = this.pendingRequests[response.id];

            const action = () => {
                if (response.error) {
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

    public request(message: string, data = {}, zone?: NgZone) {

        const messageID = this.guid.generate();

        this.pendingRequests[messageID] = {
            zone,
            type: RequestType.Once,
            stream: new AsyncSubject<any>(),
        };

        console.trace("Sending", message, "(", messageID, ")", data);

        ipcRenderer.send("data-request", {
            id: messageID,
            message,
            data
        });
        return this.pendingRequests[messageID].stream;
    }

    public watch(message: string, data = {}, zone?: NgZone) {

        const messageID = this.guid.generate();

        this.pendingRequests[messageID] = {
            zone,
            type: RequestType.Watch,
            stream: new Subject<any>()
        };

        ipcRenderer.send("data-request", {
            id: messageID,
            message,
            data
        });

        return this.pendingRequests[messageID].stream;
    }

    public notify(message: any): void {
        ipcRenderer.send("notification", {message});
    }
}
