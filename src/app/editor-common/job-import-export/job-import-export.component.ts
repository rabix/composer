import {
    Component, EventEmitter, Input, OnChanges, OnInit, Output, Renderer2, SimpleChanges,
    ViewChild, ChangeDetectorRef
} from "@angular/core";
import {FormControl} from "@angular/forms";
import * as Yaml from "js-yaml";
import {LoadOptions} from "js-yaml";
import {FormAsyncValidator} from "../../core/forms/helpers/form-async-validator";
import {AppHelper} from "../../core/helpers/AppHelper";
import {FileRepositoryService} from "../../file-repository/file-repository.service";
import {NativeSystemService} from "../../native/system/native-system.service";
import {AceEditorOptions} from "../../ui/code-editor-new/ace-editor-options";
import {CodeEditorComponent} from "../../ui/code-editor-new/code-editor.component";
import {ModalService} from "../../ui/modal/modal.service";
import {stringifyObject} from "../../helpers/yaml-helper";

type JobFormat = "json" | "yaml";

@Component({
    selector: "ct-job-import-export",
    templateUrl: "./job-import-export.component.html",
    styleUrls: ["./job-import-export.component.scss"]
})
export class JobImportExportComponent implements OnInit, OnChanges {


    @Input()
    activeTab: "file" | "code" = "file";

    @Input()
    action: "import" | "export";

    @Output()
    import = new EventEmitter<Object>();

    @Input()
    appID: string;

    @Input()
    job = {};

    @Input()
    exportFormat: JobFormat = "yaml";

    @ViewChild("codeEditor", {read: CodeEditorComponent})
    codeEditor: CodeEditorComponent;

    jobControl = new FormControl();

    importError: string;

    editorOptions = {
        mode: "ace/mode/yaml"
    } as Partial<AceEditorOptions>;


    constructor(public modal: ModalService,
                private native: NativeSystemService,
                private renderer: Renderer2,
                private cdr: ChangeDetectorRef,
                private fileRepository: FileRepositoryService) {
    }

    ngOnInit() {

        this.jobControl = new FormControl(stringifyObject(this.job, this.exportFormat), [],
            FormAsyncValidator.debounceValidator(control => {
                // FIXME: omfg
                // CDR does not enable the “import” button properly when typing in the editor
                setTimeout(() => {
                    this.cdr.markForCheck();
                    this.cdr.detectChanges();
                }, 10);

                return new Promise(resolve => {

                    try {
                        Yaml.safeLoad(control.value, {json: true} as LoadOptions);
                        resolve(null);
                    } catch (ex) {
                        resolve({parse: ex.message});
                    }
                });

            }));

        if (this.action === "export") {
            this.jobControl.disable();
        }
    }

    ngOnChanges(changes: SimpleChanges) {

        if (changes["job"]) {
            this.jobControl.setValue(stringifyObject(this.job, this.exportFormat));
        }

        if (changes["action"]) {
            if (this.action === "export") {
                this.jobControl.disable();
            } else {
                this.jobControl.enable();
            }

        }

        if (changes["exportFormat"]) {

            this.onFormatUpdate();
        }
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

        this.jobControl.setValue(stringifyObject(this.job, this.exportFormat));
    }

    chooseImportFile() {
        this.native.openFileChoiceDialog().then(paths => {
            return this.fileRepository.fetchFile(paths[0], true);
        }).then(content => {
            return Yaml.safeLoad(content, {json: true} as LoadOptions);
        }).then(jobObject => {
            this.import.emit(jobObject);
        }).catch(err => {
            if (err) {
                this.importError = err.message;
            }
        });
    }

    chooseExportFile(format: JobFormat) {

        let defaultPath = "job." + format;
        if (this.appID) {
            if (AppHelper.isLocal(this.appID)) {
                defaultPath = this.appID.split(".").slice(0, -1).concat(defaultPath).join(".");
            } else {
                const [, , appSlug] = this.appID.split("/");
                defaultPath         = appSlug + "." + defaultPath;
            }
        }

        this.native.createFileChoiceDialog({defaultPath}).then(path => {
            const formatted = stringifyObject(this.job, format);

            return this.fileRepository.saveFile(path, formatted);
        }).then(() => {
            return this.modal.close();
        }).catch(() => void 0);
    }

    importCode() {
        try {
            const loaded = Yaml.safeLoad(this.jobControl.value);
            this.import.emit(loaded);
        } catch (err) {
            this.importError = err;
        }
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
