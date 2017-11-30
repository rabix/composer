import {Component, EventEmitter, Input, OnInit, Output, Renderer2, SimpleChanges, ViewChild} from "@angular/core";
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

type JobFormat = "json" | "yaml";

@Component({
    selector: "ct-job-import-export",
    templateUrl: "./job-import-export.component.html",
    styleUrls: ["./job-import-export.component.scss"]
})
export class JobImportExportComponent implements OnInit {


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
                private fileRepository: FileRepositoryService) {
    }

    ngOnInit() {

        this.jobControl = new FormControl(this.stringifyJob(), [],
            FormAsyncValidator.debounceValidator(control => {
                return new Promise(resolve => {

                    try {
                        Yaml.safeLoad(control.value, {json: true} as LoadOptions);
                        resolve(null);
                    } catch (ex) {
                        console.log("Caught parsing exception", ex);
                        resolve({parse: ex.message})
                    }
                });

            }));
        if (this.action === "export") {
            this.jobControl.disable();
        }
    }

    ngOnChanges(changes: SimpleChanges) {

        if (changes["job"]) {
            this.jobControl.setValue(this.stringifyJob());
        }

        if (changes["action"]) {
            if (this.action === "export") {
                this.jobControl.disable();
            } else {
                this.jobControl.enable();
            }

        }

        if (changes["exportFormat"]) {

            this.onFormatUpdate()
        }
    }

    private stringifyJob(format: JobFormat = this.exportFormat): string {
        if (format === "json") {
            return JSON.stringify(this.job, null, 4);
        }

        const yamled = Yaml.safeDump(this.job);

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

        this.jobControl.setValue(this.stringifyJob());
    }

    chooseImportFile() {
        this.native.openFileChoiceDialog().then(paths => {
            return this.fileRepository.fetchFile(paths[0], true)
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
            const formatted = this.stringifyJob(format);
            console.log("Saving stringified", formatted);

            return this.fileRepository.saveFile(path, formatted);
        }).then(() => {
            return this.modal.close();
        }).catch(() => void 0);
    }

    importCode() {
        const loaded = Yaml.safeLoad(this.jobControl.value);
        console.log("Importing code", loaded);
        this.import.emit(loaded);
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
