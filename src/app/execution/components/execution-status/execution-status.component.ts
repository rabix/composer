import {Component, EventEmitter, Input, Output, SimpleChanges, Optional as DIOptional, Inject, OnChanges} from "@angular/core";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {AppExecution, ExecutionState} from "../../models";
import {DirectoryExplorerToken, DirectoryExplorer, FileOpenerToken, FileOpener} from "../../interfaces";
import {Optional} from "../../utilities/types";

@Component({
    selector: "ct-execution-status",
    styleUrls: ["./execution-status.component.scss"],
    templateUrl: "./execution-status.component.html"
})
export class ExecutionStatusComponent extends DirectiveBase implements OnChanges {

    @Input()
    appID: string;

    /**
     * TODO: Should emit an action that stops execution
     * @deprecated
     */
    @Output()
    stopExecution = new EventEmitter<any>();

    @Input()
    execution: Optional<Partial<AppExecution>>;

    jobFilePath: Optional<string>;

    errorLogPath: Optional<string>;

    directoryExplorer: Optional<DirectoryExplorer>;

    fileOpener: Optional<FileOpener>;

    isRunning = false;

    constructor(@DIOptional() @Inject(DirectoryExplorerToken) directoryExplorer: DirectoryExplorer,
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
        }
    }

    openFile(filePath: string, language: string): void {

        if (!this.fileOpener) {
            return;
        }

        this.fileOpener.open(filePath, language);

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
