import {Component, ElementRef, HostBinding, Input, Output, ViewChild} from "@angular/core";
import {Subject} from "rxjs/Subject";
import {SystemService} from "../../platform-providers/system.service";
import {CodeEditorComponent} from "../../ui/code-editor-new/code-editor.component";
import {ModalService} from "../../ui/modal/modal.service";
import {TreeViewService} from "../../ui/tree-view/tree-view.service";

@Component({
    selector: "ct-error-report",
    styleUrls: ["./error-report.component.scss"],
    providers: [TreeViewService],
    template: `
        <div class="main-content" [style.height.px]="400">
            <div class="editor">
                <textarea class="textbox" #textarea>{{ code }}</textarea>
            </div>
        </div>
        <div class="modal-footer pb-1 pt-1 pr-1">
            <button (click)="report()" class="btn ml-1 btn-primary" type="button mr-1">Report</button>
            <button (click)="close()" class="btn btn-secondary ml-1" type="button">Close</button>
        </div>
    `
})
export class ErrorReportComponent {

    @Input()
    @HostBinding("style.height.px")
    height = 600;

    @Input()
    @HostBinding("style.width.px")
    width = 800;

    @Input()
    code: string;

    @Output()
    action = new Subject<"close" | "save">();

    @ViewChild("textarea", {read: ElementRef})
    textarea;

    @ViewChild("editor", {read: CodeEditorComponent})
    private editor: CodeEditorComponent;

    constructor(private system: SystemService, private modal: ModalService) {
    }

    // restart() {
    //     window["require"]("electron").remote.app.relaunch();
    //     window["require"]("electron").remote.app.quit();
    // }

    close(){
        this.modal.close();
    }

    report() {
        this.system.openLink("mailto:cottontail-support@sbgenomics.com?Subject=Cottontail%20Error%20Report&body="
            + this.textarea.nativeElement.value.replace(/\n\r?/g, "%0A"));
    }
}
