import {Component, Input, OnInit} from "@angular/core";
import {FormControl} from "@angular/forms";
import {CodeSwapService} from "../../core/code-content-service/code-content.service";
import {DataGatewayService} from "../../core/data-gateway/data-gateway.service";
import {AppHelper} from "../../core/helpers/AppHelper";
import {AppTabData} from "../../core/workbox/app-tab-data";
import {FileRepositoryService} from "../../file-repository/file-repository.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {StatusBarService} from "../status-bar/status-bar.service";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {ErrorWrapper} from "../../core/helpers/error-wrapper";

@Component({
    selector: "ct-file-editor",
    styleUrls: ["./file-editor.component.scss"],
    providers: [CodeSwapService],
    template: `
        <ct-action-bar>
            <div class="document-controls" *ngIf="!unavailableError">
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
        
        <div class="editor-layout">
            <ct-circular-loader *ngIf="isLoading"></ct-circular-loader>

            <div class="full-size-table-display" *ngIf="!!unavailableError">
                <div class="vertically-aligned-cell text-md-center">
                    <p>This file is currently unavailable.</p>
                    <p>{{ unavailableError }}</p>
                </div>
            </div>

            <ct-code-editor
                *ngIf="!isLoading && !unavailableError"
                [formControl]="fileContent"
                [filePath]="tabData.id">
            </ct-code-editor>
        </div>
    `
})
export class FileEditorComponent extends DirectiveBase implements OnInit {
    @Input()
    tabData: AppTabData;

    fileContent = new FormControl(undefined);

    isLoading = true;

    /** Error message about file availability */
    unavailableError;

    isDirty = false;

    constructor(private dataGateway: DataGatewayService,
                private codeSwapService: CodeSwapService,
                private fileRepository: FileRepositoryService,
                private localRepository: LocalRepositoryService,
                private status: StatusBarService) {
        super();
    }

    ngOnInit(): void {
        // Subscribe editor content to tabData code changes
        this.tabData.fileContent.subscribeTracked(this, (code: string) => {
            this.isLoading = false;
            this.fileContent.setValue(code);
        }, (err) => {
            this.isLoading = false;
            this.unavailableError = new ErrorWrapper(err).toString() || "Error occurred while opening file";
        });

        // Set this app's ID to the code content service
        this.codeSwapService.appID = this.tabData.id;

        const codeChanges = this.fileContent.valueChanges.distinctUntilChanged();

        /** Save to swap all code changes*/
        codeChanges.subscribeTracked(this, content => this.codeSwapService.codeContent.next(content));

        codeChanges.skip(1).subscribeTracked(this, () => {
            this.setAppDirtyState(true);
        });

        this.localRepository.getAppMeta(this.tabData.id, "isDirty").subscribeTracked(this, (isModified) => {
            this.isDirty = !!isModified;
        });

    }

    save() {
        const filename = AppHelper.getBasename(this.tabData.id);
        const proc = this.status.startProcess(`Saving: ${filename}`);

        this.fileRepository.saveFile(this.tabData.id, this.fileContent.value).then(() => {
            this.status.stopProcess(proc, `Saved: ${filename}`);

            this.setAppDirtyState(false);

        }, err => {
            this.status.stopProcess(proc, `Could not save ${filename} (${err})`);
            console.warn("Error with file saving", err);
        });
    }

    setAppDirtyState(isModified: boolean) {
        this.localRepository.patchAppMeta(this.tabData.id, "isDirty", isModified);
    }

}
