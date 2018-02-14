import {Injectable} from "@angular/core";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {IpcService} from "../../services/ipc.service";
import {AppHelper} from "../helpers/AppHelper";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";


@Injectable()
export class CodeSwapService {

    originalCodeContent = new ReplaySubject<string>(1);
    codeContent         = new ReplaySubject<string>(1);

    appID: string;

    constructor(private ipc: IpcService,
                private platformRepository: PlatformRepositoryService,
                private localRepository: LocalRepositoryService) {
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

    private patchSwap(content): Promise<any[]> {
        const promises = [];
        const isLocal  = AppHelper.isLocal(this.appID);

        promises.push(this.ipc.request("patchSwap", {
            local: isLocal,
            swapID: this.appID,
            swapContent: content
        }).toPromise());

        // If there is no content swap should be deleted, so we need to remove AppMeta data
        if (!content) {

            // Remove swapUnlocked meta (only for platform apps)
            if (!isLocal) {
                promises.push(this.platformRepository.patchAppMeta(this.appID, "swapUnlocked", false));
            }

            // Remove isDirty meta
            if (!isLocal) {
                promises.push(this.platformRepository.patchAppMeta(this.appID, "isDirty", false));
            } else {
                promises.push(this.localRepository.patchAppMeta(this.appID, "isDirty", false));
            }

        }

        return Promise.all(promises);
    }
}
