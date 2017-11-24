import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, NgZone, Output, ViewChild} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {MessageType} from "../../../../electron/src/rabix-executor/executor-output";
import {NativeSystemService} from "../../native/system/native-system.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

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
                <i class="fa fa-square fa-fw"></i>
            </button>

            <button type="button" class="btn btn-secondary" ct-tooltip="View Job"
                    (click)="showJob = !showJob"
                    [class.text-warning]="showJob">

                <i class="fa fa-indent fa-fw"></i>
            </button>
        </div>
        <div *ngIf="showJob" #jobOutput class="job-preview">{{ job | json }}</div>
        <div #output class="output"></div>
    `
})

export class AppExecutionPreviewComponent extends DirectiveBase {

    @Input()
    isRunning = false;

    @Input()
    maxEntries = 20;

    @Output()
    stopExecution = new EventEmitter<any>();

    @ViewChild("output")
    private output: ElementRef;

    private messageQueue = new Subject<{ content: string, type: string }>();

    @Input()
    job = {};


    showJob = false;

    constructor(private native: NativeSystemService, private zone: NgZone) {
        super();
    }

    clear() {
        this.output.nativeElement.innerHTML = "";
    }

    ngAfterViewInit() {
        this.messageQueue.bufferTime(200).filter(msgs => msgs.length > 0).subscribeTracked(this, (messages: { content: string, type: string }[]) => {

            let lastType    = messages[0].type as MessageType;
            let accumulated = messages[0].content;

            if (messages.length > this.maxEntries) {
                this.clear();
            }

            const init = Math.max(1, messages.length - this.maxEntries);

            for (let i = init; i < messages.length; i++) {

                const msg = messages[i];

                if (msg.type === lastType) {
                    accumulated += `\n${msg.content}`;
                } else {
                    this.writeMessage(accumulated, lastType);
                    lastType    = msg.type as MessageType;
                    accumulated = msg.content;
                }

            }

            if (accumulated.length) {
                this.writeMessage(accumulated, lastType);
            }
        });
    }

    addMessage(content: string, type?: MessageType) {

        this.messageQueue.next({content, type});
    }

    private writeMessage(content: string, type: MessageType) {
        this.zone.runOutsideAngular(() => {
            const nel = this.output.nativeElement as HTMLDivElement;

            const entry       = document.createElement("div") as HTMLDivElement;
            entry.textContent = content;
            entry.classList.add("msg");

            if (type === "ERROR") {

                entry.classList.add("text-error");

            } else if (type === "OUTDIR") {

                entry.textContent = "";

                const link     = document.createElement("button") as HTMLButtonElement;
                link.innerText = `Click here to see the execution output directory.`;
                link.type      = "button";
                link.className = "btn btn-unstyled btn-link outdir-link";

                link.addEventListener("click", () => {
                    this.native.exploreFolder(content);
                });

                entry.appendChild(link);
            }


            nel.appendChild(entry);

            const numEntries = nel.childNodes.length;

            if (numEntries > this.maxEntries) {
                nel.removeChild(nel.childNodes.item(0));
            }

            nel.scrollTop = nel.scrollHeight;
        });
    }
}
