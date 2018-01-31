import {Component, EventEmitter, Input, Output, SimpleChanges, Optional, Inject} from "@angular/core";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import * as moment from "moment";
import {ExecutionError, ExecutionState, StepExecution} from "../../models";
import {DirectoryExplorerToken, DirectoryExplorer, TabManagerToken, TabManager} from "../../interfaces";

@Component({
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
            <button *ngIf="tabManager"
                    type="button" class="btn btn-secondary" ct-tooltip="Open Job File"
                    (click)="openFile(jobFilePath, 'ace/mode/json')"
                    [disabled]="!jobFilePath || error?.type === 'requirement'">
                <i class="fa fa-indent fa-fw"></i>
            </button>

            <!--Open Outdir Button-->
            <button type="button" class="btn btn-secondary" ct-tooltip="Open Output Directory"
                    *ngIf="explorer"
                    [class.text-info]="executionState === 'completed'"
                    [disabled]="!outdir || error?.type === 'requirement'"
                    (click)="explorer.explore(outdir)">
                <i class="fa fa-folder-open fa-fw"></i>
            </button>


            <!--Open Error Log Button-->
            <button *ngIf="tabManager"
                    type="button" class="btn btn-secondary" ct-tooltip="Open Error Log"
                    [class.text-warning]="executionState === 'failed'"
                    (click)="openFile(errorLogPath, 'ace/mode/apache_conf')"
                    [disabled]="!errorLogPath || error?.type === 'requirement'">
                <i class="fa fa-exclamation-circle fa-fw"></i>
            </button>


        </div>

        <div class="status">
            <div *ngIf="!stepStates" #output class="p-1">
                Before executing an analysis, make sure that Docker is running and that you have Java Runtime
                Environment version 8+ installed.<br/>
                Check here for the progress of your execution.
            </div>


            <div *ngIf="error" class="execution-failure">Execution failed with exit code {{ error.code }}</div>
            <div *ngIf="error && error.message" class="p-1">{{ error.message }}</div>

            <div *ngIf="stepStates && (!error || error?.type === 'execution')" class="p-1">
                <div *ngFor="let step of stepStates"
                     [class.text-error]="step.state === 'failed'"
                     [class.text-info]="step.state === 'started'"
                     [class.text-success]="step.state === 'completed'"
                >

                    <i class="fa fa-fw"
                       [class.fa-clock-o]="!step.state || step.state === 'pending'"
                       [class.fa-spin]="step.state === 'started' || step.state === 'pending'"
                       [class.fa-circle-o-notch]="step.state === 'started'"
                       [class.fa-circle-thin]="step.state === 'stopped'"
                       [class.fa-times-circle]="step.state === 'failed'"
                       [class.fa-check-circle]="step.state === 'completed'"
                    ></i>{{ step?.label || step.id }}

                    <span class="text-muted">
                    {{ step.state }}
                    
                    <ng-container *ngIf="step.state === 'started' && step.startTime">
                        {{ step.startTime | amTimeAgo:false }}
                    </ng-container>   
                    
                                        
                    <ng-container *ngIf="(step.state === 'completed' || step.state === 'failed') && step.endTime && step.startTime">
                        after {{ getDuration(step.endTime - step.startTime) }}
                    </ng-container>   
                </span>
                </div>
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
    appID: string;

    @Input()
    outdir: string;

    @Input()
    jobFilePath: string;

    @Input()
    errorLogPath: string;

    @Input()
    executionState: ExecutionState;

    @Input()
    stepStates: StepExecution[];

    @Input()
    error: ExecutionError;

    constructor(@Optional() @Inject(DirectoryExplorerToken)
                public explorer: DirectoryExplorer,

                @Optional() @Inject(TabManagerToken)
                public tabManager: TabManager) {
        super();
    }

    ngOnChanges(changes: SimpleChanges) {

        if (changes["outdir"]) {
            this.jobFilePath  = this.outdir ? this.outdir + "/job.json" : undefined;
            this.errorLogPath = this.outdir ? this.outdir + "/stderr.log" : undefined;
        }

    }

    /**
     * Get a precise human-readable duration based on a number of ms
     */
    getDuration(d: number) {
        const time  = moment.duration(d, "milliseconds");
        const order = ["years", "months", "days", "hours", "minutes", "seconds", "milliseconds"];
        const short = ["y", "m", "d", "h", "min", "s", "ms"];

        const pair = [];
        for (let i = 0; i < order.length; i++) {
            const amount = time.get(order[i] as any);

            if (amount > 0) {
                pair.push(amount + short[i]);
            }

            if (pair.length >= 2) {
                break;
            }
        }

        return pair.join(" ");
    }

    openFile(filePath: string, language: string): void {

        if (!this.tabManager) {
            return;
        }

        const tab = this.tabManager.getOrCreate({
            id: filePath,
            label: filePath,
            type: "Code",
            isWritable: false,
            language
        });

        this.tabManager.open(tab);

    }


}
