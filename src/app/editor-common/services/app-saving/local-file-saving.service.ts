import {Injectable} from "@angular/core";
import {IpcService} from "../../../services/ipc.service";
import {AppSaver} from "./app-saver.interface";

@Injectable()
export class LocalFileSavingService implements AppSaver {

    constructor(private ipc: IpcService) {

    }

    save(appID: string, content: string) {

        return this.ipc.request("saveFileContent", {
            path: appID,
            content
        }).map(() => content).toPromise();
    };
}
