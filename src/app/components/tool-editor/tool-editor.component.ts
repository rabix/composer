import * as Yaml from "js-yaml";
import {
    Component,
    OnInit,
    Input,
    OnDestroy,
    ViewChild,
    ViewContainerRef,
    TemplateRef
} from "@angular/core";
import {FormControl, FormGroup, FormBuilder} from "@angular/forms";
import {BehaviorSubject} from "rxjs/Rx";
import {ModalService} from "../modal";
import {noop} from "../../lib/utils.lib";
import {CommandLineToolModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../common/component-base";
import {Validation} from "cwlts/models/helpers/validation";
import {DataEntrySource} from "../../sources/common/interfaces";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import {WebWorkerService} from "../../services/web-worker/web-worker.service";
import {UserPreferencesService} from "../../services/storage/user-preferences.service";
import {ValidationResponse} from "../../services/web-worker/json-schema/json-schema.service";
import {EditorInspectorService} from "../../editor-common/inspector/editor-inspector.service";
import {PlatformAPI} from "../../services/api/platforms/platform-api.service";
import {StatusBarService} from "../../core/status-bar/status-bar.service";
import {WorkboxTab} from "../workbox/workbox-tab.interface";
import LoadOptions = jsyaml.LoadOptions;

require("./tool-editor.component.scss");

@Component({
    selector: "ct-tool-editor",
    providers: [
        EditorInspectorService,
        WebWorkerService
    ],
    template: `
        <block-loader *ngIf="isLoading"></block-loader>
        
        <div class="editor-container" [hidden]="isLoading">
        
            <!--Control Header-->
            <ct-editor-controls>
                <!--Revisions-->
                <button class="btn btn-secondary btn-sm" type="button"
                        [ct-editor-inspector]="revisions"
                        *ngIf="this.data.data.source !== 'local'">
                        Revision: {{ toolModel.customProps['sbg:revision']}}
                        
                        <template #revisions>
                            <ct-revision-list [active]="toolModel.customProps['sbg:revision']" 
                                              [revisions]="toolModel.customProps['sbg:revisionsInfo']"
                                              (select)="openRevision($event)">
                            </ct-revision-list>
                        </template>
                </button>
                
                <!--Copy-->
                <button class="btn btn-secondary btn-sm" type="button">
                    Copy...
                </button>
                
                <!--Save-->
                <button [disabled]="!data.isWritable" 
                        (click)="save()"
                        class="btn btn-secondary btn-sm" type="button">
                        Save
                </button>
            </ct-editor-controls>

                    
            <!--Header & Editor Column-->
            <div class="editor-content flex-row">
                <!--Editor Row-->
                        <ct-code-editor-x *ngIf="viewMode === viewModes.Code" class="editor" 
                                          [(content)]="rawEditorContent"
                                          [options]="{theme: 'ace/theme/monokai'}"
                                          [language]="'yaml'"
                                          [readonly]="!data.isWritable"></ct-code-editor-x>
                        
                        <!--GUI Editor-->
                        <ct-clt-editor *ngIf="viewMode === viewModes.Gui"
                                       class="gui-editor-component flex-col"
                                       [readonly]="!data.isWritable"
                                       [formGroup]="toolGroup"
                                       [model]="toolModel"></ct-clt-editor>
                                       
                                       
                    <!--Object Inspector Column-->
                    <div class="flex-col inspector-col" >
                        <ct-editor-inspector class="tool-inspector">
                            <template #inspector></template>
                        </ct-editor-inspector>
                    </div>
            </div>
            
            <div *ngIf="reportPanel" class="app-report-panel layout-section">
                <ct-validation-report *ngIf="reportPanel === 'validation'" [issues]="validation"></ct-validation-report>
                <ct-command-line-preview *ngIf="reportPanel === 'commandLinePreview'" [commandLineParts]="commandLineParts"></ct-command-line-preview>
                
            </div>
            
            <template #statusControls>
                <span class="btn-group">
                    <button [disabled]="!validation || (!validation.errors.length && !validation.warnings.length)" 
                            [class.btn-primary]="reportPanel === 'validation'"
                            [class.btn-secondary]="reportPanel !== 'validation'"
                            (click)="toggleReport('validation')" 
                            class="btn btn-sm">
                            
                        <span *ngIf="validation?.errors?.length">
                            <i class="fa fa-times-circle text-danger"></i> {{validation.errors.length}} Errors
                        </span>
                        
                        <span *ngIf="!validation?.errors?.length && validation?.warnings?.length">
                            <i class="fa fa-exclamation-triangle text-warning"></i> {{validation.warnings.length}} Warnings
                        </span>
                        
                        <span *ngIf="!validation?.errors?.length && !validation?.warnings?.length">
                            No Issues
                        </span>
                        
                        
                    </button>
                    
                    <button [class.btn-secondary]="reportPanel !== 'commandLinePreview'"
                            [class.btn-primary]="reportPanel == 'commandLinePreview'"
                            [disabled]="!isValidCWL"
                            (click)="toggleReport('commandLinePreview')" 
                            class="btn btn-secondary btn-sm">Preview</button>
                </span>
                
                <span class="btn-group">
                    <button class="btn btn-secondary btn-sm" 
                            (click)="switchView(viewModes.Code)"
                            [class.btn-primary]="viewMode === viewModes.Code"
                            [class.btn-secondary]="viewMode !== viewModes.Code">Code</button>
                            
                    <button class="btn btn-secondary btn-sm"
                            [disabled]="!isValidCWL"
                            (click)="switchView(viewModes.Gui)"
                            [class.btn-primary]="viewMode === viewModes.Gui"
                            [class.btn-secondary]="viewMode !== viewModes.Gui">Visual</button>
                            
                    <button class="btn btn-secondary btn-sm"
                            [disabled]="!isValidCWL"
                            (click)="switchView(viewModes.Test)"
                            [class.btn-primary]="viewMode === viewModes.Test"
                            [class.btn-secondary]="viewMode !== viewModes.Test">Test</button>
                </span>
            </template>
        </div>
    `
})
export class ToolEditorComponent extends ComponentBase implements OnInit, OnDestroy, WorkboxTab {
    @Input()
    public data: DataEntrySource;

    /** ValidationResponse for current document */
    public validation: ValidationResponse;

    /** Default view mode. */
    @Input()
    public viewMode;

    /** Flag to indicate the document is loading */
    private isLoading = true;

    /** Flag for showing reformat prompt on GUI switch */
    private showReformatPrompt = true;

    /** Flag for bottom panel, shows validation-issues, commandline, or neither */
    //@todo(maya) consider using ct-panel-switcher instead
    private reportPanel: "validation" |"commandLinePreview" | undefined;

    /** Flag for validity of CWL document */
    private isValidCWL = false;

    /** Stream of contents in code editor */
    private rawEditorContent = new BehaviorSubject("");

    /** Model that's recreated on document change */
    private toolModel = new CommandLineToolModel("document");

    /** Sorted array of resulting command line parts */
    private commandLineParts: CommandLinePart[];

    /** Template of the status controls that will be shown in the status bar */
    @ViewChild("statusControls")
    private statusControls: TemplateRef;

    private viewModes = {
        Code: 'code',
        Gui: 'gui',
        Test: 'test'
    };

    private toolGroup: FormGroup;

    @ViewChild("inspector", {read: ViewContainerRef})
    private inspectorHostView: ViewContainerRef;

    @Input()
    public showInspector = false;

    constructor(private webWorkerService: WebWorkerService,
                private userPrefService: UserPreferencesService,
                private formBuilder: FormBuilder,
                private platform: PlatformAPI,
                private inspector: EditorInspectorService,
                private statusBar: StatusBarService,
                private modal: ModalService) {

        super();

        this.viewMode = this.viewModes.Code;

        this.toolGroup = formBuilder.group({});

        this.tracked = this.userPrefService.get("show_reformat_prompt", true, true).subscribe(x => this.showReformatPrompt = x);

        this.tracked = this.inspector.inspectedObject.map(obj => obj !== undefined)
            .subscribe(show => this.showInspector = show);

    }

    ngOnInit(): void {
        // Whenever the editor content is changed, validate it using a JSON Schema.
        this.tracked = this.rawEditorContent
            .skip(1)
            .distinctUntilChanged()
            .subscribe(latestContent => {
                this.webWorkerService.validateJsonSchema(latestContent);
            });

        // Whenever content of a file changes, forward the change to the raw editor content steam.
        const statusID = this.statusBar.startProcess(`Loading ${this.data.data.id}`);
        this.tracked   = this.data.content.subscribe(val => {
            this.rawEditorContent.next(val);
            this.statusBar.stopProcess(statusID);
        });

        this.statusBar.setControls(this.statusControls);

        /**
         * Track validation results.
         * If content is not valid CWL, show the code.
         * If it's a valid CWL, parse it into a model, and show the GUI mode on first load.
         */
        this.tracked = this.webWorkerService.validationResultStream.map(r => {
            if (!r.isValidCwl) {
                // turn off loader and load document as code
                this.isLoading = false;
                return r;
            }

            // load JSON to generate model
            let json = Yaml.safeLoad(this.rawEditorContent.getValue(), {
                json: true
            } as LoadOptions);

            // should show prompt, but json is already reformatted
            if (this.showReformatPrompt && json["rbx:modified"]) {
                this.showReformatPrompt = false;
            }

            // generate model and get command line parts
            this.toolModel        = new CommandLineToolModel("document", json);
            this.commandLineParts = this.toolModel.getCommandLineParts();

            // update validation stream on model validation updates

            this.toolModel.setValidationCallback((res: Validation) => {
                this.validation = {
                    errors: res.errors,
                    warnings: res.warnings,
                    isValidatableCwl: true,
                    isValidCwl: true,
                    isValidJSON: true
                };
            });

            this.toolModel.validate();

            // load document in GUI and turn off loader, only if loader was active
            if (this.isLoading) {
                this.viewMode  = this.viewModes.Gui;
                this.isLoading = false;
            }

            console.log("Second validation")
            return {
                errors: this.toolModel.validation.errors,
                warnings: this.toolModel.validation.warnings,
                isValidatableCwl: true,
                isValidCwl: true,
                isValidJSON: true
            };

        }).subscribe((v) => {
            this.validation = v;
            this.isValidCWL = v.isValidCwl;
        });
    }

    private save() {
        const text = this.toolGroup.dirty ? this.getModelText() : this.rawEditorContent.getValue();

        // For local files, just save and that's it
        if (this.data.data.source === "local") {
            const path = this.data.data.path;

            const statusID = this.statusBar.startProcess(`Saving ${path}...`, `Saved ${path}`);
            this.data.data.save(text).subscribe(() => {
                this.statusBar.stopProcess(statusID);
            });
            return;
        }

        // For Platform files, we need to ask for a revision note
        this.modal.prompt({
            cancellationLabel: "Cancel",
            confirmationLabel: "Publish",
            content: "Revision Note",
            title: "Publish a new App Revision",
            formControl: new FormControl('')
        }).then(revisionNote => {

            const path     = this.data.data["sbg:id"] || this.data.data.id;
            const statusID = this.statusBar.startProcess(`Creating a new revision of ${path}`);
            this.data.save(JSON.parse(text), revisionNote).subscribe(result => {
                const cwl = JSON.stringify(result.message, null, 4);
                this.rawEditorContent.next(cwl);
                this.statusBar.stopProcess(statusID, `Created revision ${result.message['sbg:latestRevision']} from ${path}`);

            });
        }, noop);

    }

    /**
     * Toggles between GUI and Code view. If necessary, it will show a prompt about reformatting
     * when switching to GUI view.
     *
     * @param mode
     */
    private switchView(mode) {

        if (mode === this.viewModes.Gui) {

            if (this.showReformatPrompt) {
                this.modal.checkboxPrompt({
                    title: "Confirm GUI Formatting",
                    content: "Activating GUI mode might change the formatting of this document. Do you wish to continue?",
                    cancellationLabel: "Cancel",
                    confirmationLabel: "OK",
                    checkboxLabel: "Don't show this dialog again",
                }).then(res => {
                    if (res) this.userPrefService.put("show_reformat_prompt", false);

                    this.showReformatPrompt = false;
                    this.viewMode           = mode;
                }, noop);

            } else {
                this.viewMode = mode;
            }
        } else if (mode === this.viewModes.Code) {
            if (this.toolGroup.dirty) {
                this.rawEditorContent.next(this.getModelText());
            }

            this.viewMode = mode;
        }
    }

    /**
     * Serializes model to text. It also adds rbx:modified flag to indicate
     * the text has been formatted by the GUI editor
     */
    private getModelText(): string {
        const modelObject = Object.assign(this.toolModel.serialize(), {"rbx:modified": true});

        return this.data.language.value === "json" ? JSON.stringify(modelObject, null, 4) : Yaml.dump(modelObject);
    }

    private toggleReport(panel: "validation" | "commandLinePreview") {
        this.reportPanel = this.reportPanel === panel ? undefined : panel;
    }

    private openRevision(revisionNumber: number) {
        this.platform.getAppCWL(this.data.data, revisionNumber).subscribe(cwl => {
            this.rawEditorContent.next(cwl);
        });
    }

    ngAfterViewInit() {
        this.inspector.setHostView(this.inspectorHostView);
        super.ngAfterViewInit();
    }

    provideStatusControls() {
        return this.statusControls;
    }
}
