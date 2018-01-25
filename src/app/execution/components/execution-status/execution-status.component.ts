import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ChangeDetectorRef} from "@angular/core";
import {NativeSystemService} from "../../../native/system/native-system.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {Store} from "@ngrx/store";
import {StepState, AppExecutionState} from "../../reducers";
import {WorkboxService} from "../../../core/workbox/workbox.service";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-execution-status",
    styleUrls: ["./execution-status.component.scss"],

    template: `
        <div class="controls">
            <!--Stop Execution Button-->
            <button class="btn btn-secondary" type="button" ct-tooltip="Stop Execution"
                    (click)="stopExecution.emit()"
                    [class.text-danger]="isRunning"
                    [disabled]="!isRunning">
                <i class="fa fa-square fa-fw"></i>
            </button>

            <!--Show Job  Button -->
            <button type="button" class="btn btn-secondary" ct-tooltip="Open Job File"
                    (click)="openFile(jobFilePath, 'json')"
                    [disabled]="!jobFilePath || errorMessage">
                <i class="fa fa-indent fa-fw"></i>
            </button>

            <!--Open Outdir Button-->
            <button type="button" class="btn btn-secondary" ct-tooltip="Open Output Directory"
                    [disabled]="!outDirPath || errorMessage"
                    (click)="openDirectory(outDirPath)">
                <i class="fa fa-folder-open fa-fw"></i>
            </button>


            <!--Open Error Log Button-->
            <button type="button" class="btn btn-secondary" ct-tooltip="Open Error Log"
                    (click)="openFile(errorLogPath, 'text')"
                    [disabled]="!errorLogPath || errorMessage">
                <i class="fa fa-exclamation-circle fa-fw"></i>
            </button>


        </div>

        <div *ngIf="!stepStates" #output class="p-1 status">
            Before executing an analysis, make sure that Docker is running and that you have Java Runtime
            Environment version 8+ installed.<br/>
            Check here for the progress of your execution.
        </div>

        <div *ngIf="errorMessage" class="p-1 status">{{ errorMessage }}</div>

        <div *ngIf="stepStates && !errorMessage" class="p-1 status">
            <div *ngFor="let step of stepStates"
                 [class.text-muted]="step.state === 'pending' || step.state === 'cancelled'"
                 [class.text-error]="step.state === 'failed'"
                 [class.text-info]="step.state === 'started'"
                 [class.text-success]="step.state === 'completed'"
                 [class.text-warning]="step.state === 'terminated'"
            >

                <i class="fa fa-fw"
                   [class.fa-clock-o]="!step.state"
                   [class.fa-cog]="step.state === 'started'"
                   [class.fa-spin]="step.state === 'started' || step.state === 'pending'"
                   [class.fa-ban]="step.state === 'terminated'"

                   [class.fa-circle-o-notch]="step.state === 'pending'"
                   [class.fa-circle-thin]="step.state === 'cancelled'"
                   [class.fa-times-circle]="step.state === 'failed'"
                   [class.fa-check-circle]="step.state === 'completed'"
                ></i>{{ step?.label || step.id }}
            </div>
        </div>
    `
})

export class ExecutionStatusComponent extends DirectiveBase {

    @Input()
    isRunning = false;

    @Output()
    stopExecution = new EventEmitter<any>();

    @Input()
    job = {};

    @Input()
    appID: string;

    @Input()
    stepStates: StepState[] = [];

    @Input()
    outDirPath: string;

    @Input()
    jobFilePath: string;

    @Input()
    errorLogPath: string;

    @Input()
    errorMessage: string;

    constructor(private native: NativeSystemService,
                private cdr: ChangeDetectorRef,
                private workbox: WorkboxService,
                private store: Store<any>) {
        super();

    }

    openDirectory(dir: string): void {
        this.native.exploreFolder(dir);
    }

    openFile(filePath: string, language: string): void {

        const tab = this.workbox.getOrCreateAppTab({
            id: filePath,
            label: filePath,
            type: "Code",
            isWritable: false,
            language
        });

        this.workbox.openTab(tab, true, true, true);
    }

    ngOnInit() {

        this.store.select("execution", "progress", this.appID)
            .distinctUntilChanged()
            .subscribeTracked(this, (state: Partial<AppExecutionState> = {}) => {

                this.stepStates   = state.stepProgress;
                this.outDirPath   = state.outDirPath;
                this.jobFilePath  = this.outDirPath + "/job.json";
                this.errorLogPath = this.outDirPath + "/stderr.log";
                this.errorMessage = state.errorMessage;

                this.cdr.markForCheck();
                this.cdr.detectChanges();
            });
    }

}
