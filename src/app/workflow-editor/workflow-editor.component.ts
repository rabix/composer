import * as Yaml from "js-yaml";
import {
    Component,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef,
    ViewEncapsulation
} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {BehaviorSubject} from "rxjs/Rx";
import {Validation} from "cwlts/models/helpers/validation";
import {EditorInspectorService} from "../editor-common/inspector/editor-inspector.service";
import {DataEntrySource} from "../sources/common/interfaces";
import {ComponentBase} from "../components/common/component-base";
import {WorkboxTab} from "../components/workbox/workbox-tab.interface";
import {UserPreferencesService} from "../services/storage/user-preferences.service";
import {PlatformAPI} from "../services/api/platforms/platform-api.service";
import {StatusBarService} from "../core/status-bar/status-bar.service";
import {ModalService} from "../components/modal/modal.service";
import {noop} from "../lib/utils.lib";
import {WorkflowFactory, WorkflowModel} from "cwlts/models";
import {
    CwlSchemaValidationWorkerService,
    ValidationResponse
} from "../editor-common/cwl-schema-validation-worker/cwl-schema-validation-worker.service";
import LoadOptions = jsyaml.LoadOptions;

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-workflow-editor",
    styleUrls: ["./workflow-editor.component.scss"],
    host: {
        "class": "tab-container"
    },
    providers: [EditorInspectorService],
    template: `
        <block-loader *ngIf="isLoading"></block-loader>

        <div class="editor-container" [hidden]="isLoading">

            <!--Control Header-->
            <ct-editor-controls>

                <!--View Modes-->
                <span class="btn-group pull-left">
                    <button class="btn btn-secondary btn-sm"
                            (click)="switchView(viewModes.Code)"
                            [class.btn-primary]="viewMode === viewModes.Code"
                            [class.btn-secondary]="viewMode !== viewModes.Code">Code</button>
                            
                    <button class="btn btn-secondary btn-sm"
                            [disabled]="!isValidCWL"
                            (click)="switchView(viewModes.Gui)"
                            [class.btn-primary]="viewMode === viewModes.Gui"
                            [class.btn-secondary]="viewMode !== viewModes.Gui">Not Really Visual</button>       
                    
                    <button class="btn btn-secondary btn-sm"
                            [disabled]="!isValidCWL"
                            (click)="switchView(viewModes.Graph)"
                            [class.btn-primary]="viewMode === viewModes.Graph"
                            [class.btn-secondary]="viewMode !== viewModes.Graph">Very Visual</button>
                            
                    <button class="btn btn-secondary btn-sm"
                            [disabled]="!isValidCWL"
                            (click)="switchView(viewModes.Test)"
                            [class.btn-primary]="viewMode === viewModes.Test"
                            [class.btn-secondary]="viewMode !== viewModes.Test">Test</button>

                    <button class="btn btn-secondary btn-sm"
                            [disabled]="!isValidCWL"
                            (click)="switchView(viewModes.Info)"
                            [class.btn-primary]="viewMode === viewModes.Info"
                            [class.btn-secondary]="viewMode !== viewModes.Info">App Info</button>
                </span>

                <!--CWLVersion-->
                <span class="tag tag-default">{{ workflowModel.cwlVersion }}</span>

                <!--Revisions-->
                <button class="btn btn-secondary btn-sm" type="button"
                        [ct-editor-inspector]="revisions"
                        *ngIf="this.data.data.source !== 'local'">
                    Revision: {{ workflowModel.customProps['sbg:revision']}}

                    <template #revisions>
                        <ct-revision-list [active]="workflowModel.customProps['sbg:revision']"
                                          [revisions]="workflowModel.customProps['sbg:revisionsInfo']"
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
            <div class="editor-content flex-row fixed">
                <!--Editor Row-->
                <ct-code-editor-x *ngIf="viewMode === viewModes.Code" class="editor"
                                  [class.flex-col]="showInspector"
                                  [(content)]="rawEditorContent"
                                  [options]="{theme: 'ace/theme/monokai'}"
                                  [language]="'yaml'"
                                  [readonly]="!data.isWritable"></ct-code-editor-x>

                <!--GUI Editor-->
                <ct-workflow-not-graph-editor *ngIf="viewMode === viewModes.Gui"
                                              class="gui-editor-component flex-col"
                                              [readonly]="!data.isWritable"
                                              [model]="workflowModel"></ct-workflow-not-graph-editor>

                <ct-workflow-graph-editor *ngIf="viewMode === viewModes.Graph"
                                          [readonly]="!data.isWritable"
                                          [model]="workflowModel"
                                          class="gui-editor-component flex-col">

                </ct-workflow-graph-editor>

                <ct-app-info *ngIf="viewMode === viewModes.Info"
                                  [class.flex-col]="showInspector"
                                  [model]="workflowModel">
                </ct-app-info>

                <!--Object Inspector Column-->
                <div [hidden]="!showInspector" class="flex-col inspector-col">
                    <ct-editor-inspector class="object-inspector">
                        <template #inspector></template>
                    </ct-editor-inspector>
                </div>
            </div>

            <div *ngIf="reportPanel" class="app-report-panel layout-section">
                <ct-validation-report *ngIf="reportPanel === 'validation'" [issues]="validation"></ct-validation-report>
            </div>

            <template #statusControls>
                <span class="btn-group">
                    <button [disabled]="!validation"
                            [class.btn-primary]="reportPanel === 'validation'"
                            [class.btn-secondary]="reportPanel !== 'validation'"
                            (click)="toggleReport('validation')"
                            class="btn btn-sm">
                            
                        <span *ngIf="validation?.errors?.length">
                            <i class="fa fa-times-circle text-danger"></i> {{validation.errors.length}} Errors
                        </span>
                        
                        <span *ngIf="validation?.warnings?.length" [class.pl-1]="validation?.errors?.length">
                            <i class="fa fa-exclamation-triangle text-warning"></i> {{validation.warnings.length}} Warnings
                        </span>
                        
                        <span *ngIf="!validation?.errors?.length && !validation?.warnings?.length">
                            No Issues
                        </span>
                        
                        
                    </button>
                </span>
            </template>
        </div>
    `
})
export class WorkflowEditorComponent extends ComponentBase implements OnInit, OnDestroy, WorkboxTab {
    @Input()
    public data: DataEntrySource;

    /** ValidationResponse for current document */
    public validation: ValidationResponse;

    @Input()
    public showInspector = true;

    /** Default view mode. */
    @Input()
    public viewMode;

    /** Flag to indicate the document is loading */
    private isLoading = true;

    /** Flag for showing reformat prompt on GUI switch */
    private showReformatPrompt = true;

    /** Flag for bottom panel, shows validation-issues, commandline, or neither */
    private reportPanel: "validation" | "commandLinePreview" | undefined;

    /** Flag for validity of CWL document */
    private isValidCWL = false;

    /** Stream of contents in code editor */
    private rawEditorContent = new BehaviorSubject("");

    /** Model that's recreated on document change */
    private workflowModel: WorkflowModel = WorkflowFactory.from(null, "document");

    /** Template of the status controls that will be shown in the status bar */
    @ViewChild("statusControls")
    private statusControls: TemplateRef<any>;

    private viewModes = {
        Code: "code",
        Gui: "gui",
        Test: "test",
        Graph: "graph",
        Info: "info"
    };

    private toolGroup: FormGroup;

    @ViewChild("inspector", {read: ViewContainerRef})
    private inspectorHostView: ViewContainerRef;


    constructor(private cwlValidatorService: CwlSchemaValidationWorkerService,
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

                this.cwlValidatorService.validate(latestContent).then(r => {
                    if (!r.isValidCwl) {
                        // turn off loader and load document as code
                        this.validation = r;
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

                    this.workflowModel = WorkflowFactory.from(json, "document");
                    console.log(this.workflowModel);

                    // update validation stream on model validation updates

                    this.workflowModel.setValidationCallback((res: Validation) => {
                        this.validation = {
                            errors: res.errors,
                            warnings: res.warnings,
                            isValidatableCwl: true,
                            isValidCwl: true,
                            isValidJSON: true
                        };
                    });

                    this.workflowModel.validate();

                    // load document in GUI and turn off loader, only if loader was active
                    if (this.isLoading) {
                        this.viewMode = this.viewModes.Gui;
                        this.isLoading = false;
                    }

                    const out = {
                        errors: this.workflowModel.validation.errors,
                        warnings: this.workflowModel.validation.warnings,
                        isValidatableCwl: true,
                        isValidCwl: true,
                        isValidJSON: true
                    };
                    this.validation = out;
                    this.isValidCWL = out.isValidCwl;
                });
                // this.webWorkerService.validateJsonSchema(latestContent);
            });

        // Whenever content of a file changes, forward the change to the raw editor content steam.
        const statusID = this.statusBar.startProcess(`Loading ${this.data.data.id}`);
        this.tracked = this.data.content.subscribe(val => {
            this.rawEditorContent.next(val);
            this.statusBar.stopProcess(statusID);
        });

        this.statusBar.setControls(this.statusControls);
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
            formControl: new FormControl("")
        }).then(revisionNote => {

            const path = this.data.data["sbg:id"] || this.data.data.id;
            const statusID = this.statusBar.startProcess(`Creating a new revision of ${path}`);
            this.data.save(JSON.parse(text), revisionNote).subscribe(result => {
                const cwl = JSON.stringify(result.message, null, 4);
                this.rawEditorContent.next(cwl);
                this.statusBar.stopProcess(statusID, `Created revision ${result.message["sbg:latestRevision"]} from ${path}`);

            });
        }, noop);

    }

    /**
     * Toggles between GUI and Code view. If necessary, it will show a prompt about reformatting
     * when switching to GUI view.
     *
     * @param mode
     */
    private switchView(mode): void {

        // if (mode === this.viewModes.Gui && this.showReformatPrompt) {
        //
        //     this.modal.checkboxPrompt({
        //         title: "Confirm GUI Formatting",
        //         content: "Activating GUI mode might change the formatting of this document. Do you wish to continue?",
        //         cancellationLabel: "Cancel",
        //         confirmationLabel: "OK",
        //         checkboxLabel: "Don't show this dialog again",
        //     }).then(res => {
        //         if (res) this.userPrefService.put("show_reformat_prompt", false);
        //
        //         this.showReformatPrompt = false;
        //         this.viewMode           = mode;
        //     }, noop);
        //     return;
        // }

        if (mode === this.viewModes.Code && this.toolGroup.dirty) {
            this.rawEditorContent.next(this.getModelText());
        }

        if (mode === this.viewModes.Graph) {

        }

        this.viewMode = mode;
    }

    /**
     * Serializes model to text. It also adds rbx:modified flag to indicate
     * the text has been formatted by the GUI editor
     */
    private getModelText(): string {
        const modelObject = Object.assign(this.workflowModel.serialize(), {"rbx:modified": true});

        return this.data.language.value === "json" ? JSON.stringify(modelObject, null, 4) : Yaml.dump(modelObject);
    }

    private toggleReport(panel: "validation") {
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
