import {Component, Input, OnInit} from "@angular/core";
import {FormControl} from "@angular/forms";
import {AppTabData} from "../../core/workbox/app-tab-data";
import {DirectiveBase} from "../../util/directive-base/directive-base";

@Component({
    selector: "ct-file-editor",
    styleUrls: ["./file-editor.component.scss"],
    template: `
        <ct-action-bar>
            <div class="document-controls">
                <button [disabled]="!data.isWritable" class="btn btn-secondary btn-sm" type="button" (click)="save()">
                    <i class="fa fa-fw fa-save"></i>
                </button>
            </div>
        </ct-action-bar>
        <ct-code-editor [formControl]="fileContent"
                        [filePath]="data.id"></ct-code-editor>
    `
})
export class FileEditorComponent extends DirectiveBase implements OnInit {
    @Input()
    data: AppTabData;

    fileContent = new FormControl(undefined);

    ngOnInit(): void {
        this.fileContent.setValue(this.data.fileContent);
    }

    save() {
        console.log("Saving!", this.fileContent.value);
        // // For local files, just save and that's it
        // if (this.data.data.source === "local") {
        //     const path = this.data.data.path;
        //
        //     const statusID = this.statusBar.startProcess(`Saving ${path}...`, `Saved ${path}`);
        //     this.data.data.save(this.rawEditorContent.getValue()).subscribe(() => {
        //         this.statusBar.stopProcess(statusID);
        //     });
        //     return;
        // }

    }
}
