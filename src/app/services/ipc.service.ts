import {Injectable} from "@angular/core";
import {GuidService} from "./guid.service";
import {Observable, AsyncSubject} from "rxjs";

const {ipcRenderer} = window.require("electron");

@Injectable()
export class IpcService {

    private pendingRequests: {[id: string]: AsyncSubject<any>} = {};

    constructor(private guid: GuidService) {
        ipcRenderer.on("data-reply", (sender, response) => {

            console.debug("Data reply received", response);
            this.pendingRequests[response.id].next(response.data);
            this.pendingRequests[response.id].complete();
            delete this.pendingRequests[response.id];

        });
    }

    public request(message: string, data = {}) {
        const messageID = this.guid.generate();

        this.pendingRequests[messageID] = new AsyncSubject();
        console.trace("Sending", message , "(", messageID,")", data);
        ipcRenderer.send("data-request", {
            id: messageID,
            message,
            data
        });

        return this.pendingRequests[messageID].flatMap(response => {
            if (response.error) {
                return Observable.throw(response.error);
            }

            return Observable.of(response);
        });
    }
}