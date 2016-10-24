import {Injectable} from "@angular/core";
import {GuidService} from "./guid.service";
import {ReplaySubject} from "rxjs";

const {ipcRenderer} = window.require("electron");

@Injectable()
export class IpcService {

    private pendingRequests = {};

    constructor(private guid: GuidService) {
        ipcRenderer.on("data-reply", (sender, response) => {

            this.pendingRequests[response.id].next(response.data);
            delete this.pendingRequests[response.id];

        });
    }

    public request(message: string, data = {}) {
        const messageID = this.guid.generate();

        this.pendingRequests[messageID] = new ReplaySubject(1);

        ipcRenderer.send("data-request", {
            id: messageID,
            message,
            data
        });

        return this.pendingRequests[messageID].first();
    }
}