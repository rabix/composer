import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output} from "@angular/core";

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: "ct-app-execution-preview",
    styleUrls: ["./app-execution-preview.component.scss"],

    template: `
        <div class="controls">
            <button class="btn btn-secondary" type="button"
                    ct-tooltip="Stop Execution"
                    (click)="stopExecution.emit()"
                    [disabled]="!isRunning">
                <i class="fa fa-times"></i>
            </button>
        </div>
        <div class="output" [innerHTML]="content"></div>
    `
})

export class AppExecutionPreviewComponent implements OnInit, OnChanges {
    @Input()
    content: string;

    @Input()
    isRunning = false;

    @Output()
    stopExecution = new EventEmitter<any>();

    constructor(private el: ElementRef) {
    }

    ngOnInit() {
    }

    ngOnChanges() {

        setTimeout(() => {
            const nel     = this.el.nativeElement as Element;
            nel.scrollTop = nel.scrollHeight;
        });
    }
}
