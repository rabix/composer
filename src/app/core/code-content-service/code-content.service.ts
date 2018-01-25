import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {IpcService} from "../../services/ipc.service";
import {AppHelper} from "../helpers/AppHelper";


@Injectable()
export class CodeSwapService {

    originalCodeContent = new ReplaySubject<string>(1);
    codeContent         = new ReplaySubject<string>(1);

    appID: string;

    constructor(private ipc: IpcService) {

        this.codeContent.debounceTime(500)
            .filter(() => this.appID !== undefined)
            .subscribe(content => {
                this.patchSwap(content);
            });

        this.codeContent.take(1).subscribe(this.originalCodeContent);
    }

    discardSwapContent() {
        return this.patchSwap(null);
    }

    private patchSwap(content) {
        return this.ipc.request("patchSwap", {
            local: AppHelper.isLocal(this.appID),
            swapID: this.appID,
            swapContent: content
        });
    }
}
