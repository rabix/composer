import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {AppExecutionContext, ExecutorConfig} from "../../../electron/src/storage/types/executor-config";
import {AppHelper} from "../core/helpers/AppHelper";
import {LocalRepositoryService} from "../repository/local-repository.service";
import {PlatformRepositoryService} from "../repository/platform-repository.service";
import {IpcService} from "../services/ipc.service";

@Injectable()
export class ExecutorService {


    constructor(private ipc: IpcService,
                private localRepository: LocalRepositoryService,
                private platformRepository: PlatformRepositoryService) {

    }

    getConfig<T extends keyof ExecutorConfig>(key: T): Observable<ExecutorConfig[T]> {
        return this.localRepository.getExecutorConfig().map(c => c[key]);
    }

    getVersion(): Observable<string> {
        return this.getConfig("path").switchMap(path => this.ipc.request("probeExecutorVersion"))

    }

    run(appID: string, content: string, jobPath: string, options = {}): Observable<string> {
        return this.ipc.watch("executeApp", {
            appID,
            content,
            jobPath,
            options
        }).takeWhile(val => val !== null);
    }

    getEnvironment(appID: string): Observable<ExecutorConfig> {
        return this.localRepository.getExecutorConfig()
    }

    getAppConfig(appID: string): Observable<AppExecutionContext> {
        const metaFetch = AppHelper.isLocal(appID)
            ? this.localRepository.getAppMeta(appID, "executionConfig")
            : this.platformRepository.getAppMeta(appID, "executionConfig");

        return metaFetch.map(meta => meta || {});
    }

    setAppConfig(appID: string, data: AppExecutionContext) {
        const isLocal = AppHelper.isLocal(appID);

        if (isLocal) {
            return this.localRepository.patchAppMeta(appID, "executionConfig", data);
        }

        return this.platformRepository.patchAppMeta(appID, "executionConfig", data);

    }
}
