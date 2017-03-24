import {Component, Input, OnInit} from "@angular/core";
import {FormControl} from "@angular/forms";
import {AppTabData} from "../../core/workbox/app-tab-data";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {DataGatewayService} from "../../core/data-gateway/data-gateway.service";
import {StatusBarService} from "../status-bar/status-bar.service";

@Component({
    selector: "ct-file-editor",
    styleUrls: ["./file-editor.component.scss"],
    template: `
        <ct-action-bar>
            <div class="document-controls">
                <button [disabled]="!data.isWritable"
                        class="btn btn-secondary btn-sm"
                        tooltipPlacement="bottom"
                        ct-tooltip="Save As..."
                        (click)="save()"
                        type="button">
                    <i class="fa fa-fw fa-save"></i>
                </button>
            </div>
        </ct-action-bar>
        <ct-code-editor [formControl]="fileContent" [filePath]="data.id"></ct-code-editor>
    `
})
export class FileEditorComponent extends DirectiveBase implements OnInit {
    @Input()
    data: AppTabData;

    fileContent = new FormControl(undefined);

    constructor(private gateway: DataGatewayService,
                private status: StatusBarService) {
        super();
    }

    ngOnInit(): void {
        this.fileContent.setValue(this.data.fileContent);
    }

    save() {
        const filename = this.data.id.split("/").pop();
        const proc     = this.status.startProcess(`Saving: ${filename}`);

        this.gateway.saveFile(this.data.id, this.fileContent.value).subscribe(() => {
            this.status.stopProcess(proc, `Saved: ${filename}`);
        }, err => {
            this.status.stopProcess(proc, `Could not save ${filename} (${err})`);
            console.warn("Error with file saving", err);
        });
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
