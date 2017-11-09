import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {AppExecutionContext, ExecutorConfig} from "../../../electron/src/storage/types/executor-config";
import {AppHelper} from "../core/helpers/AppHelper";
import {LocalRepositoryService} from "../repository/local-repository.service";
import {PlatformRepositoryService} from "../repository/platform-repository.service";
import {IpcService} from "../services/ipc.service";
import {takeWhile} from "rxjs/operator/takeWhile";

@Injectable()
export class ExecutorService {

    private config        = new ReplaySubject<ExecutorConfig>(1);
    private executorState = new ReplaySubject<"VALID" | "INVALID" | "UNSET">(1);

    constructor(private ipc: IpcService,
                private localRepository: LocalRepositoryService,
                private platformRepository: PlatformRepositoryService) {

        this.localRepository.getExecutorConfig().subscribe(this.config);

        this.bindExecutorStateStream();
    }

    private bindExecutorStateStream() {
        this.getConfig("path").switchMap(path => {
            if (!path) {
                return Observable.of("UNSET");
            }

            return this.ipc.request("probeExecutorVersion").map(versionString => {
                if (versionString.startsWith("Version:")) {
                    return "VALID";
                }

                return "INVALID";
            });
        }).subscribe(this.executorState);
    }

    getConfig<T extends keyof ExecutorConfig>(key: T): Observable<ExecutorConfig[T]> {
        return this.config.map(c => c[key]);
    }

    /**
     * Probes the executor path for Bunny version.
     * Returns a message in the format “Version: #” if successful, or a description why it failed
     */
    getVersion(): Observable<string> {
        return this.getConfig("path").switchMap(path => this.ipc.request("probeExecutorVersion"))
    }

    getExecutorState() {
        return this.executorState.asObservable();
    }

    run(appID: string, content: string, options = {}): Observable<string> {

        const isLocal = AppHelper.isLocal(appID);
        const appSource = isLocal ? "local" : "user";

        return this.ipc.watch("executeApp", {
            appID,
            content,
            appSource,
            options
        }).takeWhile(val => val !== null);
    }

    getEnvironment(appID: string): Observable<ExecutorConfig> {
        return this.localRepository.getExecutorConfig()
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

export interface RabixExecutorResult {
    output: RabixExecutorResultOutput[]
}

export interface RabixExecutorResultOutput {
    basename: string,
    checksum: string,
    class: string,
    dirname: string,
    location: string,
    nameext: string,
    nameroot: string,
    path: string,
    secondaryFiles: string[],
    size: number
}
