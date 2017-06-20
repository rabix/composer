import {Component, Input, NgZone, OnDestroy, OnInit, TemplateRef, ViewChild, ViewContainerRef} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {WorkflowFactory, WorkflowModel} from "cwlts/models";
import * as Yaml from "js-yaml";
import {Observable, Subject} from "rxjs/Rx";
import {PlatformAPIGatewayService} from "../auth/api/platform-api-gateway.service";
import {AuthService} from "../auth/auth/auth.service";
import {DataGatewayService} from "../core/data-gateway/data-gateway.service";
import {PublishModalComponent} from "../core/modals/publish-modal/publish-modal.component";
import {AppTabData} from "../core/workbox/app-tab-data";
import {
    CwlSchemaValidationWorkerService,
    ValidationResponse
} from "../editor-common/cwl-schema-validation-worker/cwl-schema-validation-worker.service";
import {EditorInspectorService} from "../editor-common/inspector/editor-inspector.service";
import {ErrorBarService} from "../layout/error-bar/error-bar.service";
import {StatusBarService} from "../layout/status-bar/status-bar.service";
import {noop} from "../lib/utils.lib";
import {SystemService} from "../platform-providers/system.service";
import {PlatformAPI} from "../services/api/platforms/platform-api.service";
import {CredentialsEntry} from "../services/storage/user-preferences-types";
import {ModalService} from "../ui/modal/modal.service";
import {DirectiveBase} from "../util/directive-base/directive-base";
import {WorkflowGraphEditorComponent} from "./graph-editor/graph-editor/workflow-graph-editor.component";
import {WorkflowEditorService} from "./workflow-editor.service";
import {ProceedToEditingModalComponent} from "../core/modals/proceed-to-editing-modal/proceed-to-editing-modal.component";

import LoadOptions = jsyaml.LoadOptions;


@Component({
    selector: "ct-workflow-editor",
    providers: [EditorInspectorService, ErrorBarService, WorkflowEditorService],
    styleUrls: ["./workflow-editor.component.scss"],
    template: `
        <ct-action-bar>
            <ct-tab-selector [distribute]="'auto'" [active]="viewMode"
                             (activeChange)="switchView($event)">

                <ct-tab-selector-entry [disabled]="!isValidCWL || isValidatingOrResolvingCWL()"
                                       [tabName]="'info'">App Info
                </ct-tab-selector-entry>

                <ct-tab-selector-entry [disabled]="!isValidCWL || isValidatingOrResolvingCWL()"
                                       [tabName]="'graph'">Graph View
                </ct-tab-selector-entry>

                <ct-tab-selector-entry [disabled]="!viewMode || isValidatingOrResolvingCWL()"
                                       [tabName]="'code'">Code
                </ct-tab-selector-entry>
            </ct-tab-selector>

            <div class="document-controls">

                <!--Resolve-->
                <button class="btn"
                        type="button"
                        [disabled]="isValidatingOrResolvingCWL()"
                        *ngIf="viewMode === 'code' && data.dataSource === 'local'"
                        ct-tooltip="Resolve"
                        tooltipPlacement="bottom"
                        (click)="resolveButtonClick()">
                    <i class="fa fa-refresh"></i>
                </button>

                <!--Go to app-->
                <button class="btn"
                        type="button"
                        (click)="goToApp()"
                        tooltipPlacement="bottom"
                        *ngIf="data.dataSource !== 'local'"
                        ct-tooltip="Open on Platform">
                    <i class="fa fa-external-link"></i>
                </button>

                <!--Edit-->
                <button *ngIf="!data.isWritable && data.dataSource !== 'public'"
                        class="btn"
                        type="button"
                        ct-tooltip="Edit"
                        tooltipPlacement="bottom"
                        (click)="edit()">
                    <i class="fa fa-edit"></i>
                </button>

                <!--Save-->
                <button *ngIf="data.isWritable"
                        [disabled]="isValidatingCWL"
                        (click)="save()"
                        ct-tooltip="Save"
                        [tooltipPlacement]="'bottom'"
                        class="btn" type="button">
                    <i class="fa fa-save"></i>
                </button>

                <!--Publish to Platform-->
                <button class="btn"
                        [disabled]="isValidatingOrResolvingCWL()"
                        *ngIf="data.dataSource === 'local'"
                        ct-tooltip="Publish to Platform"
                        tooltipPlacement="bottom"
                        (click)="publish()">
                    <i class="fa fa-cloud-upload"></i>
                </button>

                <!--Revisions-->
                <button *ngIf="data.dataSource !== 'local'" class="btn"
                        type="button"
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

        <ct-error-bar [autoClose]="true" [fadeOutTime]="5000">
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
                                      [appData]="data"
                                      [readonly]="!data.isWritable"
                                      [(model)]="workflowModel"
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

            <!--Perpetual spinner that indicates if CWL validation is in progress-->
            <i *ngIf="isValidatingCWL"
               class="fa fa-circle-o-notch fa-spin">
            </i>

            <span class="tag tag-warning">{{ workflowModel.cwlVersion }}</span>
            <span class="btn-group">
            <button [disabled]="!validation"
                    [class.active]="reportPanel === 'validation'"
                    (click)="toggleReport('validation')"
                    class="btn">

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
export class WorkflowEditorComponent extends DirectiveBase implements OnDestroy, OnInit {

    @Input()
    data: AppTabData;

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

    /** Flag to indicate if CWL Validation is in progress */
    isValidatingCWL = false;

    /** Flag to indicate if resolving content is in progress */
    isResolvingContent = false;

    /** Model that's recreated on document change */
    workflowModel: WorkflowModel = WorkflowFactory.from(null, "document");

    codeEditorContent = new FormControl(undefined);

    priorityCodeUpdates = new Subject<string>();

    private originalTabLabel: string;

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

    /** Indicates if we are changing revision */
    private changingRevision = false;

    constructor(private cwlValidatorService: CwlSchemaValidationWorkerService,
                private formBuilder: FormBuilder,
                private platform: PlatformAPI,
                private inspector: EditorInspectorService,
                private statusBar: StatusBarService,
                private modal: ModalService,
                private system: SystemService,
                private auth: AuthService,
                private errorBarService: ErrorBarService,
                private apiGateway: PlatformAPIGatewayService,
                private dataGateway: DataGatewayService,
                private zone: NgZone) {

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

        if (this.data.dataSource === "app" && this.hasCopyOfProperty()) {
            this.data.isWritable = false;
        }

        if (!this.data.isWritable) {
            this.codeEditorContent.disable();
        }

        // Whenever the editor content is changed, validate it using a JSON Schema.
        this.tracked = this.codeEditorContent
            .valueChanges
            .debounceTime(100)
            .merge(this.priorityCodeUpdates)
            .do(() => {
                this.isValidatingCWL = true;
            })
            .switchMap((latestContent) => Observable.fromPromise(this.cwlValidatorService.validate(latestContent))
                .map((result) => {
                        return {
                            latestContent: latestContent,
                            result: result
                        };
                    }
                ))
            .subscribe(r => {

                this.isValidatingCWL = false;

                // Wrap it in zone in order to see changes immediately in status bar (cwlValidatorService.validate is
                // in world out of Angular)
                this.zone.run(() => {

                    this.isLoading = false;

                    if (!r.result.isValidCwl) {
                        // turn off loader and load document as code
                        this.viewMode = "code";
                        this.isValidCWL = false;

                        this.validation = r.result;
                        return r;
                    }

                    this.isValidCWL = true;

                    // If you are in mode other than Code mode or mode is undefined (opening app)
                    // ChangingRevision is when you are in Code mode and you are changing revision to know to generate
                    // a new toolModel
                    if (this.viewMode !== "code" || this.changingRevision) {
                        this.changingRevision = false;
                        this.resolveContent(r.latestContent).then(noop, noop);
                    } else {
                        // In case when you are in Code mode just reset validations
                        const v = {
                            errors: [],
                            warnings: [],
                            isValidatableCwl: true,
                            isValidCwl: true,
                            isValidJSON: true
                        };

                        this.validation = v;
                    }
                });
            });

        this.codeEditorContent.setValue(this.data.fileContent);
    }

    /**
     * Resolve content and create a new tool model
     */
    resolveContent(latestContent) {

        this.isLoading = true;
        this.isResolvingContent = true;

        return new Promise((resolve, reject) => {

            // Create ToolModel from json and set model validations
            const createWorkflowModel = (json) => {
                console.log("latest content of type", typeof json);
                console.time("Workflow Model");
                this.workflowModel = WorkflowFactory.from(json as any, "document");
                console.timeEnd("Workflow Model");

                // update validation stream on model validation updates

                this.workflowModel.setValidationCallback((res) => {
                    this.validation = {
                        errors: this.workflowModel.errors,
                        warnings: this.workflowModel.warnings,
                        isValidatableCwl: true,
                        isValidCwl: true,
                        isValidJSON: true
                    };
                });

                this.workflowModel.validate();

                const out = {
                    errors: this.workflowModel.errors,
                    warnings: this.workflowModel.warnings,
                    isValidatableCwl: true,
                    isValidCwl: true,
                    isValidJSON: true
                };
                this.validation = out;

                // After wf is created get updates for steps
                this.getStepUpdates();

                if (!this.viewMode) {
                    this.viewMode = "graph";
                }
                this.isLoading = false;
            };

            // If app is a local file
            if (this.data.dataSource !== "local") {
                // load JSON to generate model
                const json = Yaml.safeLoad(latestContent, {
                    json: true
                } as LoadOptions);

                createWorkflowModel(json);
                this.isResolvingContent = false;
                resolve();

            } else {
                this.data.resolve(latestContent).subscribe((resolved) => {

                    createWorkflowModel(resolved);
                    this.isResolvingContent = false;
                    resolve();

                }, (err) => {
                    this.isLoading = false;
                    this.isResolvingContent = false;
                    this.viewMode = "code";
                    this.validation = {
                        isValidatableCwl: true,
                        isValidCwl: false,
                        isValidJSON: true,
                        warnings: [],
                        errors: [{
                            message: err.message,
                            loc: "document",
                            type: "error"
                        }]
                    };

                    reject();
                });
            }
        });
    }

    hasCopyOfProperty() {
        return typeof this.data.parsedContent["sbg:copyOf"] !== "undefined";
    }

    edit() {
        const modal = this.modal.fromComponent(ProceedToEditingModalComponent, {
            closeOnOutsideClick: false,
            backdrop: true,
            title: `Edit ${(this.data.parsedContent.label)}?`,
            closeOnEscape: true
        });

        modal.appName = this.data.parsedContent.label;
        modal.response.subscribe(val => {
            this.data.isWritable = val;
            if (val) {
                this.codeEditorContent.enable();
                this.graphEditor.enableGraphManipulations();
            }
        })
    }

    /**
     * When click on Resolve button (visible only if app is a local file and you are in Code mode)
     */
    resolveButtonClick() {
        this.resolveContent(this.codeEditorContent.value).then(noop, noop);
    }


    /**
     * Call updates service to get information about steps if they have updates and mark ones that can be updated
     */
    private getStepUpdates() {

        Observable.of(1).switchMap(() => {
            console.log("Should check for updates", this);
            // Call service only if wf is in user projects
            if (this.data.dataSource !== "local" && this.data.isWritable) {

                const [appHash] = this.data.id.split("/");
                const api       = this.apiGateway.forHash(appHash);

                return api.getUpdates(this.workflowModel.steps
                    .map(step => step.run ? step.run.customProps["sbg:id"] : null)
                    .filter(s => !!s));

                // return this.platform.getUpdates(this.workflowModel.steps
                //     .map(step => step.run ? step.run.customProps["sbg:id"] : null)
                //     .filter(s => !!s))
            }

            return Observable.of(undefined);
        }).subscribe((response) => {

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
                this.isLoading = false;
            }

        });
    }

    save() {

        if (this.data.dataSource === "local" || this.isValidCWL) {

            const proc = this.statusBar.startProcess(`Saving: ${this.originalTabLabel}`);
            const text = this.viewMode !== "code" ? this.getModelText(this.data.dataSource === "app")
                : this.codeEditorContent.value;

            this.dataGateway.saveFile(this.data.id, text).subscribe(save => {
                console.log("Saved", save);
                this.statusBar.stopProcess(proc, `Saved: ${this.originalTabLabel}`);
                this.priorityCodeUpdates.next(save);
                this.changingRevision = true;
            }, err => {
                console.log("Not saved", err);
                this.statusBar.stopProcess(proc, `Could not save ${this.originalTabLabel}`);
                this.errorBarService.showError(`Unable to save Workflow: ${err.message || err}`);
            });
        } else {
            this.errorBarService.showError(`Unable to save Workflow because JSON Schema is invalid`);
        }
    }

    /**
     * Toggles between GUI and Code view. If necessary, it will show a prompt about reformatting
     * when switching to GUI view.
     *
     * @param mode
     * @param serialize
     */
    switchView(tabName): void {

        if (!tabName) {
            return;
        }

        setTimeout(() => {

            // If you are changing from other mode to a Code mode
            if (this.viewMode !== "code" && tabName === "code") {
                this.codeEditorContent.setValue(this.getModelText());
                this.viewMode = tabName;
                return;
            }

            // If you are changing from Code mode to another mode you have to resolve the content
            if ((this.viewMode === "code" || !this.viewMode) && tabName !== "code") {

                // Trick that will change reference for tabselector highlight line (to reset it to a Code if resolve fails)
                this.viewMode = undefined;

                // Resolve content
                this.resolveContent(this.codeEditorContent.value).then(() => {
                    this.viewMode = tabName;
                }, () => {
                    // If fails open Code mode
                    this.viewMode = "code";
                });


            } else {
                // If changing from/to mode that is not a Code mode, just switch
                this.viewMode = tabName;
            }
        });
    }

    /**
     * Serializes model to text. It also adds sbg:modified flag to indicate
     * the text has been formatted by the GUI editor
     */
    private getModelText(embed = false): string {
        const wf = embed ? this.workflowModel.serializeEmbedded() : this.workflowModel.serialize();
        const modelObject = Object.assign(wf, {"sbg:modified": true});

        console.log("serialized workflow", modelObject);

        return this.data.language === "json" || this.data.dataSource === "app" ?
            JSON.stringify(modelObject, null, 4) : Yaml.dump(modelObject);
    }

    toggleReport(panel: "validation") {
        this.reportPanel = this.reportPanel === panel ? undefined : panel;
    }

    openRevision(revisionNumber: number) {
        const fileWithoutRevision = this.data.id.split("/");

        // In the case when id is without revision number
        if (!isNaN(+fileWithoutRevision[fileWithoutRevision.length - 1])) {
            fileWithoutRevision.pop();
        }

        fileWithoutRevision.push(revisionNumber.toString());

        const fid = fileWithoutRevision.join("/");

        this.dataGateway.fetchFileContent(fid).subscribe(txt => {
            this.priorityCodeUpdates.next(txt);
            this.changingRevision = true;
        });
    }

    provideStatusControls() {
        return this.statusControls;
    }


    /**
     * Open workflow in browser
     */
    goToApp() {
        const urlApp = this.workflowModel["sbgId"];
        const urlProject = urlApp.split("/").splice(0, 2).join("/");

        this.auth.connections.take(1).subscribe((cred: CredentialsEntry[]) => {
            const hash = this.data.id.split("/")[0];
            const urlBase = cred.find(c => c.hash === hash);
            if (!urlBase) {
                this.errorBarService.showError(`Could not externally open app "${urlApp}"`);
                return;
            }
            const url = urlBase.url;

            this.system.openLink(`${url}/u/${urlProject}/apps/#${urlApp}`);
        });
    }

    onTabActivation(): void {
        if (this.graphEditor) {
            this.graphEditor.checkOutstandingGraphFitting();
        }
    }

    publish() {
        if (this.isValidCWL) {
            // Before you publish a local file you have to resolve the content
            this.resolveContent(this.codeEditorContent.value).then(() => {
                const component = this.modal.fromComponent(PublishModalComponent, {
                    title: "Publish an App",
                    backdrop: true
                });

                component.appContent = this.workflowModel.serializeEmbedded();
            }, () => {
                this.errorBarService.showError(`Unable to Publish Workflow because Schema Salad Resolver failed`);
            });
        } else {
            this.errorBarService.showError(`Unable to Publish Workflow because JSON Schema is invalid`);
        }
    }

    registerOnTabLabelChange(update: (label: string) => void, originalLabel: string) {
        this.originalTabLabel = originalLabel;
    }

    isValidatingOrResolvingCWL() {
        return this.isValidatingCWL || this.isResolvingContent;
    }
}
