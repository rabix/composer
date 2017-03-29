import {Component, Input, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {WorkflowFactory, WorkflowModel} from "cwlts/models";
import {Validation} from "cwlts/models/helpers/validation";
import * as Yaml from "js-yaml";
import {Observable, Subject} from "rxjs/Rx";
import {DataGatewayService} from "../core/data-gateway/data-gateway.service";
import {AppTabData} from "../core/workbox/app-tab-data";
import {WorkboxTab} from "../core/workbox/workbox-tab.interface";
import {
    CwlSchemaValidationWorkerService,
    ValidationResponse
} from "../editor-common/cwl-schema-validation-worker/cwl-schema-validation-worker.service";
import {EditorInspectorService} from "../editor-common/inspector/editor-inspector.service";
import {ErrorBarService} from "../layout/error-bar/error-bar.service";
import {StatusBarService} from "../layout/status-bar/status-bar.service";
import {SystemService} from "../platform-providers/system.service";
import {PlatformAPI} from "../services/api/platforms/platform-api.service";
import {SettingsService} from "../services/settings/settings.service";
import {DirectiveBase} from "../util/directive-base/directive-base";

import LoadOptions = jsyaml.LoadOptions;
import {WorkflowGraphEditorComponent} from "./graph-editor/graph-editor/workflow-graph-editor.component";

@Component({
    selector: "ct-workflow-editor",
    providers: [EditorInspectorService, ErrorBarService],
    styleUrls: ["./workflow-editor.component.scss"],
    template: `
        <ct-action-bar>
            <ct-tab-selector [distribute]="'auto'" [active]="viewMode" (activeChange)="switchView($event)">

                <ct-tab-selector-entry [disabled]="!isValidCWL"
                                       [tabName]="'info'">App Info
                </ct-tab-selector-entry>

                <ct-tab-selector-entry [disabled]="!isValidCWL"
                                       [tabName]="'graph'">Graph View
                </ct-tab-selector-entry>

                <ct-tab-selector-entry [disabled]="!viewMode"
                                       [tabName]="'code'">Code
                </ct-tab-selector-entry>
            </ct-tab-selector>

            <div class="document-controls">

                <!--CWLVersion-->
                <span class="btn btn-sm">{{workflowModel.cwlVersion}}</span>

                <!--Go to app-->
                <button class="btn btn-sm btn-secondary "
                        type="button"
                        (click)="goToApp()"
                        tooltipPlacement="bottom"
                        ct-tooltip="Open on Seven Bridges Platform">
                    <i class="fa fa-external-link"></i>
                </button>

                <!--Save-->
                <button [disabled]="!data.isWritable"
                        (click)="save()"
                        ct-tooltip="Save"
                        [tooltipPlacement]="'bottom'"
                        class="btn btn-sm btn-secondary" type="button">
                    <i class="fa fa-save"></i>
                </button>

                <!--Copy-->
                <button class="btn btn-sm btn-secondary "
                        type="button"
                        ct-tooltip="Save As..."
                        tooltipPlacement="bottom">
                    <i class="fa fa-copy"></i>
                </button>

                <!--Revisions-->
                <button *ngIf="data.dataSource !== 'local'" class="btn btn-sm btn-secondary" type="button"
                        ct-tooltip="See Revision History"
                        tooltipPlacement="bottom"
                        [ct-editor-inspector]="revisions">

                    Revision: {{ workflowModel.customProps['sbg:revision']}}

                    <ng-template #revisions>
                        <ct-revision-list [active]="workflowModel.customProps['sbg:revision']"
                                          [revisions]="workflowModel.customProps['sbg:revisionsInfo']"
                                          (select)="openRevision($event)">
                        </ct-revision-list>
                    </ng-template>
                </button>

            </div>
        </ct-action-bar>

        <ct-error-bar>
        </ct-error-bar>

        <div class="editor-layout">

            <ct-circular-loader *ngIf="isLoading"></ct-circular-loader>

            <!--Editor Row-->
            <ct-code-editor *ngIf="viewMode === 'code' && !isLoading"
                            [formControl]="codeEditorContent"
                            [options]="{mode: 'ace/mode/yaml'}"
                            class="editor">
            </ct-code-editor>

            <ct-workflow-graph-editor *ngIf="viewMode === 'graph' && !isLoading"
                                      [readonly]="!data.isWritable"
                                      [model]="workflowModel"
                                      class="editor-main">
            </ct-workflow-graph-editor>

            <ct-app-info *ngIf="viewMode === 'info' && !isLoading"
                         [readonly]="!data.isWritable"
                         [class.flex-col]="showInspector"
                         [model]="workflowModel">
            </ct-app-info>

            <!--Object Inspector Column-->
            <ct-editor-inspector [class.flex-hide]="!showInspector">
                <ng-template #inspector></ng-template>
            </ct-editor-inspector>
        </div>

        <!--Header & Editor Column-->


        <div *ngIf="reportPanel" class="app-report-panel layout-section">
            <ct-validation-report *ngIf="reportPanel === 'validation'"
                                  [issues]="validation"></ct-validation-report>
        </div>

        <ng-template #statusControls>
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
        </ng-template>
    `
})
export class WorkflowEditorComponent extends DirectiveBase implements OnDestroy, OnInit, WorkboxTab {


    @Input()
    data: AppTabData;

    isDirty = false;

    /** ValidationResponse for current document */
    validation: ValidationResponse;

    showInspector = true;

    /** Default view mode. */
    viewMode: "info" | "graph" | "code" | string;

    /** Flag to indicate the document is loading */
    isLoading = true;

    /** Flag for bottom panel, shows validation-issues, commandline, or neither */
    reportPanel: "validation" | "commandLinePreview" | undefined;

    /** Flag for validity of CWL document */
    isValidCWL = false;

    /** Model that's recreated on document change */
    workflowModel: WorkflowModel = WorkflowFactory.from(null, "document");

    codeEditorContent = new FormControl(undefined);

    priorityCodeUpdates = new Subject<string>();

    @ViewChild(WorkflowGraphEditorComponent)
    private graphEditor: WorkflowGraphEditorComponent;

    /** Flag for showing reformat prompt on GUI switch */
    private showReformatPrompt = true;

    /** Template of the status controls that will be shown in the status bar */
    @ViewChild("statusControls")
    private statusControls: TemplateRef<any>;

    private toolGroup: FormGroup;

    @ViewChild("inspector", {read: ViewContainerRef})
    private inspectorHostView: ViewContainerRef;


    constructor(private cwlValidatorService: CwlSchemaValidationWorkerService,
                private formBuilder: FormBuilder,
                private platform: PlatformAPI,
                private inspector: EditorInspectorService,
                private statusBar: StatusBarService,
                private system: SystemService,
                private settings: SettingsService,
                private dataGateway: DataGatewayService) {

        super();

        this.toolGroup = formBuilder.group({});

        // @fixme Bring this back with the new service
        // this.tracked = this.userPrefService.get("show_reformat_prompt", true, true).subscribe(x => this.showReformatPrompt = x);

        this.tracked = this.inspector.inspectedObject.map(obj => obj !== undefined)
            .subscribe(show => this.showInspector = show);

    }

    ngOnInit(): void {

        this.statusBar.setControls(this.statusControls);
        this.inspector.setHostView(this.inspectorHostView);

        if (!this.data.isWritable) {
            this.codeEditorContent.disable();
        }

        // Whenever the editor content is changed, validate it using a JSON Schema.
        this.tracked = this.codeEditorContent
            .valueChanges
            .debounceTime(3000)
            .distinctUntilChanged()
            .merge(this.priorityCodeUpdates).subscribe(latestContent => {

                this.cwlValidatorService.validate(latestContent).then(r => {

                    if (!r.isValidCwl) {
                        // turn off loader and load document as code
                        this.validation = r;
                        this.isLoading  = false;

                        this.viewMode = "code";

                        return r;
                    }

                    // load JSON to generate model
                    const json = Yaml.safeLoad(this.codeEditorContent.value, {
                        json: true
                    } as LoadOptions);

                    // should show prompt, but json is already reformatted
                    if (this.showReformatPrompt && json["rbx:modified"]) {
                        this.showReformatPrompt = false;
                    }

                    this.data.resolve(latestContent).subscribe(resolved => {
                        console.log("latest content of type", typeof resolved);
                        console.time("Workflow Model");
                        this.workflowModel = WorkflowFactory.from(resolved as any, "document");
                        console.timeEnd("Workflow Model");


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

                        const out       = {
                            errors: this.workflowModel.validation.errors,
                            warnings: this.workflowModel.validation.warnings,
                            isValidatableCwl: true,
                            isValidCwl: true,
                            isValidJSON: true
                        };
                        this.validation = out;
                        this.isValidCWL = out.isValidCwl;


                        // After wf is created get updates for steps
                        this.getStepUpdates();

                        if (!this.viewMode) {
                            this.viewMode = "graph";
                        }
                        this.isLoading = false;

                    }, (err) => {
                        this.isLoading  = false;
                        this.viewMode   = "code";
                        this.isValidCWL = false;
                        this.validation = {
                            isValidatableCwl: true,
                            isValidCwl: false,
                            isValidJSON: true,
                            warnings: [],
                            errors: [{
                                message: err.message,
                                loc: "document"
                            }]
                        };
                    });

                });
            });

        this.codeEditorContent.setValue(this.data.fileContent);


    }

    /**
     * Call updates service to get information about steps if they have updates and mark ones that can be updated
     */
    private getStepUpdates() {
        Observable.of(1).switchMap(() =>
            // Call service only if wf is in user projects
            this.data.dataSource !== "local" && this.data.isWritable ?
                this.platform.getUpdates(this.workflowModel.steps
                    .map(step => step.run ? step.run.customProps["sbg:id"] : null)
                    .filter(s => !!s))
                : Observable.of(undefined))
            .subscribe((response) => {

                if (response) {
                    Object.keys(response).forEach(key => {
                        if (response[key] === true) {
                            this.workflowModel.steps
                                .filter(step => step.run.customProps["sbg:id"] === key)
                                .forEach(step => step.hasUpdate = true);
                        }
                    });
                }

                // load document in GUI and turn off loader, only if loader was active
                if (this.isLoading) {
                    // @todo: this.viewMode cannot be initially set to viewModeTypes.Graph because canvas dimensions are not initialized
                    this.viewMode  = "info";
                    this.isLoading = false;
                }

            });
    }

    save() {
        console.warn("Reimplement the save functionality");


        const text = this.getModelText();

        this.dataGateway.saveFile(this.data.id, text).subscribe(save => {
            console.log("Saved", save);
            this.priorityCodeUpdates.next();
        }, err => {
            console.log("Not saved", err);
        });
        // const text = this.toolGroup.dirty ? this.getModelText() : this.rawEditorContent.getValue();
        //
        // // For local files, just save and that's it
        // if (this.data.dataSource === "local") {
        //     const path = this.data.data.path;
        //
        //     const statusID = this.statusBar.startProcess(`Saving ${path}...`, `Saved ${path}`);
        //     this.data.data.save(text).subscribe(() => {
        //         this.statusBar.stopProcess(statusID);
        //     });
        //     return;
        // }

        // For Platform files, we need to ask for a revision note
        // this.modal.prompt({
        //     cancellationLabel: "Cancel",
        //     confirmationLabel: "Publish",
        //     content: "Revision Note",
        //     title: "Publish a new App Revision",
        //     formControl: new FormControl("")
        // }).then(revisionNote => {
        //
        //     const path     = this.data.data["sbg:id"] || this.data.data.id;
        //     const statusID = this.statusBar.startProcess(`Creating a new revision of ${path}`);
        //     this.data.save(JSON.parse(text), revisionNote).subscribe(result => {
        //         const cwl = JSON.stringify(result.message, null, 4);
        //         this.rawEditorContent.next(cwl);
        //         this.statusBar.stopProcess(statusID, `Created revision ${result.message["sbg:latestRevision"]} from ${path}`);
        //
        //     });
        // }, err => console.warn);

    }

    /**
     * Toggles between GUI and Code view. If necessary, it will show a prompt about reformatting
     * when switching to GUI view.
     *
     * @param mode
     * @param serialize
     */
    switchView(mode): void {

        // if (mode === this.viewModeTypes.Gui && this.showReformatPrompt) {
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

        setTimeout(() => {

            // @fixme should only serialize if form is dirty
            if (mode === "code" && this.isDirty) {
                this.codeEditorContent.setValue(this.getModelText());
            }

            if (mode === "graph") {

            }

            this.viewMode = mode;
        });
    }

    /**
     * Serializes model to text. It also adds rbx:modified flag to indicate
     * the text has been formatted by the GUI editor
     */
    private getModelText(): string {
        const modelObject = Object.assign(this.workflowModel.serialize(), {"rbx:modified": true});

        return this.data.language === "json" ? JSON.stringify(modelObject, null, 4) : Yaml.dump(modelObject);
    }

    toggleReport(panel: "validation") {
        this.reportPanel = this.reportPanel === panel ? undefined : panel;
    }

    openRevision(revisionNumber: number) {
        const fileWithoutRevision = this.data.id.split("/");
        fileWithoutRevision.pop();
        fileWithoutRevision.push(revisionNumber.toString());

        const fid = fileWithoutRevision.join("/");

        this.dataGateway.fetchFileContent(fid).subscribe(txt => {
            this.priorityCodeUpdates.next(txt);
        });
        // this.platform.getAppCWL(this.data.data, revisionNumber).subscribe(cwl => {
        //     this.rawEditorContent.next(cwl);
        // });
    }

    provideStatusControls() {
        return this.statusControls;
    }


    /**
     * Open workflow in browser
     */
    goToApp() {
        const urlApp     = this.workflowModel["sbgId"];
        const urlProject = urlApp.split("/").splice(0, 2).join("/");

        this.settings.platformConfiguration.first().map(settings => settings.url).subscribe((url) => {
            this.system.openLink(`${url}/u/${urlProject}/apps/#${urlApp}`);
        });
    }

    onTabActivation(): void {
        if (this.graphEditor) {
            this.graphEditor.checkOutstandingGraphFitting();
        }
    }

}
