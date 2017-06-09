import {
    AfterViewInit,
    Component,
    Input, NgZone,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {CommandLineToolFactory} from "cwlts/models/generic/CommandLineToolFactory";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import * as Yaml from "js-yaml";
import {Observable} from "rxjs/Observable";
import {ReplaySubject, Subject} from "rxjs/Rx";
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
import {SystemService} from "../platform-providers/system.service";
import {CredentialsEntry} from "../services/storage/user-preferences-types";
import {ModalService} from "../ui/modal/modal.service";
import {DirectiveBase} from "../util/directive-base/directive-base";
import LoadOptions = jsyaml.LoadOptions;
import {noop} from "../lib/utils.lib";

@Component({
    selector: "ct-tool-editor",
    styleUrls: ["./tool-editor.component.scss"],
    providers: [EditorInspectorService, ErrorBarService],
    templateUrl: "./tool-editor.component.html"
})
export class ToolEditorComponent extends DirectiveBase implements OnInit, OnDestroy, AfterViewInit {

    @Input()
    data: AppTabData;

    /** ValidationResponse for current document */
    validation: ValidationResponse;

    /** Default view mode. */
    @Input()
    viewMode: "code" | "gui" | "test" | "info";

    /** Flag to indicate the document is loading */
    isLoading = true;

    /** Flag for showing reformat prompt on GUI switch */
    showReformatPrompt = true;

    /** Flag for bottom panel, shows validation-issues, commandline, or neither */
    reportPanel: "validation" | "commandLinePreview" | undefined = "commandLinePreview";

    /** Flag for validity of CWL document */
    isValidCWL = false;

    /** Flag to indicate if CWL validation is in progress */
    isValidatingCWL = false;

    /** Flag to indicate if resolving content is in progress */
    isResolvingContent = false;

    /** Model that's recreated on document change */
    toolModel = CommandLineToolFactory.from(null, "document");

    /** Sorted array of resulting command line parts */
    commandLineParts: Subject<CommandLinePart[]> = new ReplaySubject();

    /** Template of the status controls that will be shown in the status bar */
    @ViewChild("statusControls")
    private statusControls: TemplateRef<any>;

    toolGroup: FormGroup;

    @ViewChild("inspector", {read: ViewContainerRef})
    private inspectorHostView: ViewContainerRef;

    @Input()
    showInspector = false;

    private changeTabLabel: (title: string) => void;
    private originalTabLabel: string;

    codeEditorContent = new FormControl(undefined);

    priorityCodeUpdates = new Subject();

    /** Indicates if we are changing the revision manually (saving an app is also the case) */
    private changingRevision = false;

    constructor(private cwlValidatorService: CwlSchemaValidationWorkerService,
                private formBuilder: FormBuilder,
                private inspector: EditorInspectorService,
                private statusBar: StatusBarService,
                private dataGateway: DataGatewayService,
                private modal: ModalService,
                private system: SystemService,
                private auth: AuthService,
                private zone: NgZone,
                private errorBarService: ErrorBarService) {

        super();


        this.toolGroup = formBuilder.group({});

        // @fixme Bring this back with the new service
        // this.tracked = this.userPrefService.get("show_reformat_prompt", true, true).subscribe(x => this.showReformatPrompt = x);

        this.tracked = this.inspector.inspectedObject
            .map(obj => obj !== undefined)
            .subscribe(show => this.showInspector = show);
    }

    ngOnInit(): void {

        this.tracked = Observable.combineLatest(
            this.codeEditorContent.valueChanges.map(() => this.codeEditorContent.dirty),
            (codeDirty) => codeDirty
        ).debounceTime(250).subscribe(isDirty => {
            console.log("Checking dirty state", isDirty);
            const newLabel = isDirty ? `${this.originalTabLabel}` : this.originalTabLabel;
            this.changeTabLabel(newLabel);
        });

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
                        return r.result;
                    }

                    this.isValidCWL = true;

                    // If you are in mode other than Code mode or mode is undefined (opening app)
                    // Also changingRevision is added when you are in Code mode and you are changing revision to know
                    // when to generate a new toolModel
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
        this.tracked = this.priorityCodeUpdates.subscribe(txt => this.codeEditorContent.setValue(txt));

        this.statusBar.setControls(this.statusControls);
    }

    /**
     * Resolve content and create a new tool model
     */
    resolveContent(latestContent) {

        this.isLoading = true;
        this.isResolvingContent = true;

        return new Promise((resolve, reject) => {

            // Create ToolModel from json and set model validations
            const createToolModel = (json) => {
                this.toolModel = CommandLineToolFactory.from(json as any, "document");
                this.toolModel.onCommandLineResult((res) => {
                    this.commandLineParts.next(res);
                });
                this.toolModel.updateCommandLine();

                const updateValidity = () => {
                    this.validation = {
                        errors: this.toolModel.errors,
                        warnings: this.toolModel.warnings,
                        isValidatableCwl: true,
                        isValidCwl: true,
                        isValidJSON: true
                    };
                };

                // update validation stream on model validation updates
                this.toolModel.setValidationCallback(updateValidity);

                this.toolModel.validate().then(updateValidity);

                if (!this.viewMode) {
                    this.viewMode = "gui";
                }

                this.isLoading = false;
            };

            // If app is a local file
            if (this.data.dataSource !== "local") {
                // load JSON to generate model
                const json = Yaml.safeLoad(latestContent, {
                    json: true
                } as LoadOptions);

                createToolModel(json);
                this.isResolvingContent = false;
                resolve();

            } else {
                this.data.resolve(latestContent).subscribe((resolved) => {

                    createToolModel(resolved);
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

    /**
     * When click on Resolve button (visible only if app is a local file and you are in Code mode)
     */
    resolveButtonClick() {
        this.resolveContent(this.codeEditorContent.value).then(noop, noop);
    }

    save() {

        if (this.data.dataSource === "local" || this.isValidCWL) {

            const proc = this.statusBar.startProcess(`Saving: ${this.originalTabLabel}`);
            const text = this.viewMode !== "code" ? this.getModelText() : this.codeEditorContent.value;

            this.dataGateway.saveFile(this.data.id, text).subscribe(save => {
                console.log("Saved", save);
                this.statusBar.stopProcess(proc, `Saved: ${this.originalTabLabel}`);
                this.priorityCodeUpdates.next(save);
                this.changingRevision = true;
            }, err => {
                console.log("Not saved", err);
                this.statusBar.stopProcess(proc, `Could not save ${this.originalTabLabel} (${err})`);
                this.errorBarService.showError(`Unable to save Tool: ${err.message || err}`);
            });
        } else {
            this.errorBarService.showError(`Unable to save Tool because JSON Schema is invalid`);
        }
    }

    /**
     * Toggles between GUI and Code view. If necessary, it will show a prompt about reformatting
     * when switching to GUI view.
     *
     * @param mode
     */
    switchView(mode): void {

        if (mode === "gui" && this.showReformatPrompt) {

            // this.modal.checkboxPrompt({
            //     title: "Confirm GUI Formatting",
            //     content: "Activating GUI mode might change the formatting of this document. Do you wish to continue?",
            //     cancellationLabel: "Cancel",
            //     confirmationLabel: "OK",
            //     checkboxLabel: "Don't show this dialog again",
            // }).then(res => {
            //     if (res) this.userPrefService.put("show_reformat_prompt", false);
            //
            //     this.showReformatPrompt = false;
            //     this.viewMode           = mode;
            // }, noop);
            // return;
        }

        if (mode === "code" && this.toolGroup.dirty) {
            this.codeEditorContent.setValue(this.getModelText());
        }

        this.viewMode = mode;
    }

    /**
     * Serializes model to text. It also adds sbg:modified flag to indicate
     * the text has been formatted by the GUI editor
     */
    private getModelText(): string {
        const modelObject = Object.assign(this.toolModel.serialize(), {"sbg:modified": true});

        return this.data.language === "json" || this.data.dataSource === "app"
            ? JSON.stringify(modelObject, null, 4) : Yaml.dump(modelObject);
    }

    toggleReport(panel: "validation" | "commandLinePreview") {
        this.reportPanel = this.reportPanel === panel ? undefined : panel;
    }

    openRevision(revisionNumber: number | string) {
        const fileWithoutRevision = this.data.id.split("/");

        // In the case when id is without revision number
        if (!isNaN(+fileWithoutRevision[fileWithoutRevision.length - 1])) {
            fileWithoutRevision.pop();
        }

        fileWithoutRevision.push(revisionNumber.toString());
        const fid = fileWithoutRevision.join("/");
        this.dataGateway.fetchFileContent(fid).subscribe(txt => {
            this.priorityCodeUpdates.next(txt);
            this.toolGroup.reset();
            this.changingRevision = true;
        });
    }

    onJobUpdate(job) {

        this.toolModel.setJobInputs(job.inputs);
        this.toolModel.setRuntime(job.allocatedResources);
        this.toolModel.updateCommandLine();
    }

    resetJob() {
        this.toolModel.resetJobDefaults();
    }

    /**
     * Open tool in browser
     */
    goToApp() {
        const urlApp = this.toolModel["sbgId"];
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

    switchTab(tabName) {

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

                // Trick that will change reference for tabselector highlight line (to reset it to a Code mode if resolve fails)
                this.viewMode = undefined;

                // Resolve content
                this.resolveContent(this.codeEditorContent.value).then(() => {
                    this.viewMode = tabName;
                }, () => {
                    // If fails open Code mode
                    this.viewMode = "code";
                });


            } else {
                // If changing from|to mode that is not a Code mode, just switch
                this.viewMode = tabName;
            }
        });
    }


    ngAfterViewInit() {
        this.inspector.setHostView(this.inspectorHostView);
        super.ngAfterViewInit();
    }

    provideStatusControls() {
        return this.statusControls;
    }

    onTabActivation(): void {

    }

    publish() {
        if (this.isValidCWL) {
            // Before you publish a local file you have to resolve the content
            this.resolveContent(this.codeEditorContent.value).then(() => {
                const component = this.modal.fromComponent(PublishModalComponent, {
                    title: "Publish an App",
                    backdrop: true
                });

                component.appContent = this.toolModel.serialize();
            }, () => {
                this.errorBarService.showError(`Unable to Publish Tool because Schema Salad Resolver failed`);
            });
        } else {
            this.errorBarService.showError(`Unable to Publish Tool because JSON Schema is invalid`);
        }
    }

    registerOnTabLabelChange(update: (label: string) => void, originalLabel: string) {
        this.changeTabLabel = update;
        this.originalTabLabel = originalLabel;
    }

    isValidatingOrResolvingCWL() {
        return this.isValidatingCWL || this.isResolvingContent;
    }
}
