import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, Output, ViewChild} from "@angular/core";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-app-execution-preview",
    styleUrls: ["./app-execution-preview.component.scss"],

    template: `
        <div class="controls">
            <button class="btn btn-secondary" type="button" ct-tooltip="Stop Execution"
                    (click)="stopExecution.emit()"
                    [class.text-danger]="isRunning"
                    [disabled]="!isRunning">
                <i class="fa fa-square"></i>
            </button>
        </div>
        <div #output class="output" [innerHTML]="content"></div>
    `
})

export class AppExecutionPreviewComponent implements OnChanges {
    @Input()
    content: string;

    @Input()
    isRunning = false;

    @Output()
    stopExecution = new EventEmitter<any>();

    @ViewChild("output")
    private output: ElementRef;

    ngOnChanges() {

        setTimeout(() => {
            const nel     = this.output.nativeElement as Element;
            nel.scrollTop = nel.scrollHeight;
        });
    }
}
