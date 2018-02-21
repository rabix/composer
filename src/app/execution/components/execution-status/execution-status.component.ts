import {Component, Input, SimpleChanges, Optional as DIOptional, Inject, OnChanges} from "@angular/core";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {AppExecution, ExecutionState} from "../../models";
import {DirectoryExplorerToken, DirectoryExplorer, FileOpenerToken, FileOpener} from "../../interfaces";
import {Optional} from "../../utilities/types";
import {Store} from "@ngrx/store";
import {AppState} from "../../reducers";
import {ExecutionStopAction} from "../../actions/execution.actions";

@Component({
    selector: "ct-execution-status",
    styleUrls: ["./execution-status.component.scss"],
    templateUrl: "./execution-status.component.html"
})
export class ExecutionStatusComponent extends DirectiveBase implements OnChanges {

    @Input()
    appID: string;

    @Input()
    execution: Optional<Partial<AppExecution>>;

    jobFilePath: Optional<string>;

    errorLogPath: Optional<string>;

    directoryExplorer: Optional<DirectoryExplorer>;

    fileOpener: Optional<FileOpener>;

    isRunning = false;

    isOffline = false;
    dockerPullTimeoutCountdown: number;
    dockerPullTimeoutID;

    constructor(private store: Store<AppState>,
                @DIOptional() @Inject(DirectoryExplorerToken) directoryExplorer: DirectoryExplorer,
                @DIOptional() @Inject(FileOpenerToken) fileOpener: FileOpener) {
        super();

        this.fileOpener        = fileOpener;
        this.directoryExplorer = directoryExplorer;
    }

    ngOnChanges(changes: SimpleChanges) {

        if (changes["execution"]) {
            this.jobFilePath  = this.getJobFilePath();
            this.errorLogPath = this.getErrorLogPath();
            this.isRunning    = this.determineIfRunning();

            this.setupDockerTimeout();

        }
    }

    openFile(filePath: string, language: string): void {

        if (!this.fileOpener) {
            return;
        }

        this.fileOpener.open(filePath, language);

    }

    stopExecution() {
        this.store.dispatch(new ExecutionStopAction(this.appID));
    }

    private setupDockerTimeout() {
        if (this.execution && this.execution.dockerPullTimeout && this.execution.dockerPullTimeout > Date.now()) {

            this.isOffline                  = navigator.onLine === false;
            this.dockerPullTimeoutCountdown = Math.ceil((this.execution.dockerPullTimeout - Date.now()) / 1000);

            this.dockerPullTimeoutID = setTimeout(() => {
                this.setupDockerTimeout()
            }, 1000);

        } else {
            this.dockerPullTimeoutCountdown = undefined;
            clearTimeout(this.dockerPullTimeoutID);
        }

    }

    private getJobFilePath(): Optional<string> {
        if (this.execution && this.execution.outdir) {
            return this.execution.outdir + "/job.json";
        }
    }

    private getErrorLogPath(): Optional<string> {
        if (this.execution && this.execution.outdir) {
            return this.execution.outdir + "/stderr.log";
        }
    }

    private determineIfRunning(): boolean {
        const runningStates: ExecutionState[] = ["pending", "started"];

        return Boolean(this.execution && ~runningStates.indexOf(this.execution.state));
    }

}
