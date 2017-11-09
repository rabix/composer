import {ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, ViewChild} from "@angular/core";
import {NativeSystemService} from "../../native/system/native-system.service";

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
        <div #output class="output"></div>
    `
})

export class AppExecutionPreviewComponent {

    @Input()
    isRunning = false;

    @Input()
    maxEntries = 30;

    @Output()
    stopExecution = new EventEmitter<any>();

    @ViewChild("output")
    private output: ElementRef;

    constructor(private native: NativeSystemService) {

    }

    clear() {
        this.output.nativeElement.innerHTML = "";
    }

    addMessage(content: string, type: "info" | "error" | "outdir" = "info") {

        const nel = this.output.nativeElement as HTMLDivElement;

        const entry       = document.createElement("div") as HTMLDivElement;
        entry.textContent = content;
        entry.classList.add("msg");

        if (type === "error") {
            entry.classList.add("text-error");
        } else if (type === "outdir") {
            entry.textContent = "";
            const link        = document.createElement("button") as HTMLButtonElement;
            link.innerText    = `Click here to see the execution output directory.`;
            link.type         = "button";
            link.className    = "btn btn-unstyled btn-link outdir-link";

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
    }
}
