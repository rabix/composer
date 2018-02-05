import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {AppExecutionContext, ExecutorConfig} from "../../../electron/src/storage/types/executor-config";
import {AppHelper} from "../core/helpers/AppHelper";
import {LocalRepositoryService} from "../repository/local-repository.service";
import {PlatformRepositoryService} from "../repository/platform-repository.service";
import {IpcService} from "../services/ipc.service";

@Injectable()
export class ExecutorService {

    private config        = new ReplaySubject<ExecutorConfig>(1);

    constructor(private ipc: IpcService,
                private localRepository: LocalRepositoryService,
                private platformRepository: PlatformRepositoryService) {

        this.localRepository.getExecutorConfig().subscribe(this.config);
    }

    getConfig<T extends keyof ExecutorConfig>(key: T): Observable<ExecutorConfig[T]> {
        return this.config.map(c => c[key]);
    }

    /**
     * Probes the executor path for Bunny version.
     * Returns a message in the format “Version: #” if successful, or a description why it failed
     */
    getVersion(): Observable<string> {
        return this.getConfig("path")
            .distinctUntilChanged()
            .switchMap(path => this.ipc.request("probeExecutorVersion"));
    }

    /**
     * @deprecated
     */
    run(appID: string, content: string, options = {}): Observable<string> {

        const isLocal = AppHelper.isLocal(appID);
        const appSource = isLocal ? "local" : "user";

        return this.config.take(1).switchMap((config) => {
            return this.ipc.watch("executeApp", {
                appID,
                content,
                appSource,
                options,
                config
            }).takeWhile(val => val !== null);
        });
    }
    /**
     * Gets the configuration parameters for the execution context of a specific app
     */
    getAppConfig(appID: string): Observable<AppExecutionContext | null> {
        const metaFetch = AppHelper.isLocal(appID)
            ? this.localRepository.getAppMeta(appID, "executionConfig")
            : this.platformRepository.getAppMeta(appID, "executionConfig");

        // any is a hack-cast, but “executionConfig” key is actually of type AppExecutionContext
        return (metaFetch as any).map(meta => meta || {});
    }

    setAppConfig(appID: string, data: AppExecutionContext) {
        const isLocal = AppHelper.isLocal(appID);

        if (isLocal) {
            return this.localRepository.patchAppMeta(appID, "executionConfig", data);
        }

        return this.platformRepository.patchAppMeta(appID, "executionConfig", data);

    }
}

