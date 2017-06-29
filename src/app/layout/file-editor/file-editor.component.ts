import {Component, Input, OnInit} from "@angular/core";
import {FormControl} from "@angular/forms";
import {AppTabData} from "../../core/workbox/app-tab-data";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {DataGatewayService} from "../../core/data-gateway/data-gateway.service";
import {StatusBarService} from "../status-bar/status-bar.service";
import {CodeSwapService} from "../../core/code-content-service/code-content.service";

@Component({
    selector: "ct-file-editor",
    styleUrls: ["./file-editor.component.scss"],
    providers: [CodeSwapService],
    template: `
        <ct-action-bar>
            <div class="document-controls">
                <button [disabled]="!tabData.isWritable"
                        class="btn btn-secondary btn-sm"
                        tooltipPlacement="bottom"
                        ct-tooltip="Save"
                        (click)="save()"
                        type="button">
                    <i class="fa fa-fw fa-save"></i>
                </button>
            </div>
        </ct-action-bar>
        <ct-code-editor [formControl]="fileContent" [filePath]="tabData.id"></ct-code-editor>
    `
})
export class FileEditorComponent extends DirectiveBase implements OnInit {
    @Input()
    tabData: AppTabData;

    fileContent = new FormControl(undefined);

    constructor(private dataGateway: DataGatewayService,
                private codeSwapService: CodeSwapService,
                private status: StatusBarService) {
        super();
    }

    ngOnInit(): void {
        // Subscribe editor content to tabData code changes
        this.tabData.fileContent.subscribeTracked(this, (code: string) => this.fileContent.setValue(code));

        // Set this app's ID to the code content service
        this.codeSwapService.appID = this.tabData.id;

        /** Save to swap all code changes*/
        this.fileContent.valueChanges.subscribeTracked(this, content => this.codeSwapService.codeContent.next(content));
    }

    save() {
        const filename = this.tabData.id.split("/").pop();
        const proc     = this.status.startProcess(`Saving: ${filename}`);

        this.dataGateway.saveFile(this.tabData.id, this.fileContent.value).subscribe(() => {
            this.status.stopProcess(proc, `Saved: ${filename}`);
        }, err => {
            this.status.stopProcess(proc, `Could not save ${filename} (${err})`);
            console.warn("Error with file saving", err);
        });
    }
}
