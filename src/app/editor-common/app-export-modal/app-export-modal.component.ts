import {Component, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild} from "@angular/core";
import {FormControl} from "@angular/forms";
import * as Yaml from "js-yaml";
import {AppHelper} from "../../core/helpers/AppHelper";
import {FileRepositoryService} from "../../file-repository/file-repository.service";
import {NativeSystemService} from "../../native/system/native-system.service";
import {AceEditorOptions} from "../../ui/code-editor-new/ace-editor-options";
import {CodeEditorComponent} from "../../ui/code-editor-new/code-editor.component";
import {ModalService} from "../../ui/modal/modal.service";
import {stringifyObject} from "../../helpers/yaml-helper";

type ExportFormat = "json" | "yaml";

@Component({
    styleUrls: ["./app-export-modal.component.scss"],
    selector: "ct-app-export-modal",
    template: `
        <div class="header">

            <ct-tab-selector class="pull-left" distribute="auto" [(active)]="activeTab">
                <ct-tab-selector-entry tabName="file" data-test="export-file-tab">File</ct-tab-selector-entry>
                <ct-tab-selector-entry tabName="code" data-test="export-code-tab">Code</ct-tab-selector-entry>
            </ct-tab-selector>

            <button *ngIf="activeTab === 'code'" class="btn btn-link pull-right convert-btn" type="button" (click)="toggleFormat()">
                Convert to {{ exportFormat === "json" ? "YAML" : "JSON" }}
            </button>
        </div>

        <div class="body">

            <div *ngIf="activeTab === 'file'" class="dialog-centered dialog-content">
                <p>Choose file format to export to</p>
                <p>
                    <button class="btn btn-secondary" (click)="chooseExportFile('yaml')">
                        Export as YAML
                    </button>
                    <button class="btn btn-secondary" (click)="chooseExportFile('json')">
                        Export as JSON
                    </button>
                </p>
            </div>

            <!--If we want to add a platform projects, we may have multiple steps-->
            <ng-container *ngIf="activeTab === 'code'">
                <ct-code-editor #codeEditor [options]="editorOptions" class="code-preview" [formControl]="contentControl"></ct-code-editor>
            </ng-container>

            <div class="modal-footer" *ngIf="activeTab === 'code'">

                <button type="button" class="btn btn-secondary" data-test="modal-close-button" (click)="modal.close()">Cancel
                </button>

                <button data-test="copy-to-clipboard-btn"
                        class="btn btn-primary"
                        (click)="copyToClipboard($event)"
                        type="button">Copy to Clipboard
                </button>
            </div>
        </div>


    `
})
export class AppExportModalComponent implements OnInit, OnChanges {

    @Input()
    activeTab: "file" | "code" = "file";

    @Input()
    appID: string;

    @Input()
    exportFormat: ExportFormat = "yaml";

    @ViewChild("codeEditor", {read: CodeEditorComponent})
    codeEditor: CodeEditorComponent;

    @Input()
    appContent: Object;

    contentControl = new FormControl();

    editorOptions = {
        mode: "ace/mode/yaml"
    } as Partial<AceEditorOptions>;


    constructor(public modal: ModalService,
                private native: NativeSystemService,
                private renderer: Renderer2,
                private fileRepository: FileRepositoryService) {
    }

    ngOnInit() {

        this.contentControl = new FormControl({
            value: this.stringifyContent(),
            disabled: true
        });
    }

    ngOnChanges(changes: SimpleChanges) {

        if (changes["appContent"]) {
            this.contentControl.setValue(this.appContent);
        }

        if (changes["exportFormat"]) {
            this.onFormatUpdate();
        }
    }

    private stringifyContent(content = this.appContent, format: ExportFormat = this.exportFormat): string {
        if (format === "json") {
            return JSON.stringify(content, null, 4);
        }

        const yamled = Yaml.safeDump(content);

        // Handle the bug with js-yaml where an empty object would be serialized as "{}" (yaml should not do that)
        if (yamled === "{}\n") {
            return "";
        }

        return yamled;

    }

    toggleFormat() {
        this.exportFormat = this.exportFormat === "json" ? "yaml" : "json";
        this.onFormatUpdate();
    }


    private onFormatUpdate() {
        const yamlMode = "ace/mode/yaml";
        const jsonMode = "ace/mode/json";

        this.editorOptions = {mode: this.exportFormat === "json" ? jsonMode : yamlMode};
        this.codeEditor.getEditorInstance().setOptions(this.editorOptions);

        this.contentControl.setValue(this.stringifyContent());
    }

    chooseExportFile(format: ExportFormat) {

        let defaultPath = `${this.appID}.${format}`;
        if (this.appID) {
            if (AppHelper.isLocal(this.appID)) {
                defaultPath = this.appID.split(".").slice(0, -1).concat(format).join(".");
            } else {
                const [, , appSlug] = this.appID.split("/");
                defaultPath         = appSlug + "." + format;
            }
        }

        this.native.createFileChoiceDialog({defaultPath}).then(path => {
            const formatted = stringifyObject(this.appContent, format);

            return this.fileRepository.saveFile(path, formatted);
        }).then(() => {
            return this.modal.close();
        }).catch(() => void 0);
    }

    copyToClipboard(event: MouseEvent) {
        const ace = this.codeEditor.getEditorInstance();

        const cursorPos            = ace.getCursorPosition();
        const selectionRange       = ace.selection.getRange();
        const isBackwardsSelection = ace.selection.isBackwards();

        ace.selectAll();
        ace.focus();
        document.execCommand("copy");
        ace.clearSelection();

        ace.moveCursorToPosition(cursorPos);
        ace.selection.setRange(selectionRange, isBackwardsSelection);

        const btn = event.target as HTMLButtonElement;

        const originalContent = btn.textContent;
        btn.style.width       = window.getComputedStyle(btn).width;
        btn.textContent       = "Copied!";
        btn.disabled          = true;

        setTimeout(() => {
            btn.textContent = originalContent;
            btn.disabled    = false;
        }, 1000);
    }

}
