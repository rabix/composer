import {
    AfterViewInit,
    Component,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {CommandLineToolFactory} from "cwlts/models/generic/CommandLineToolFactory";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import {Validation} from "cwlts/models/helpers/validation";
import * as Yaml from "js-yaml";
import {ReplaySubject, Subject} from "rxjs/Rx";
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
import {AuthService} from "../auth/auth/auth.service";
import {CredentialsEntry} from "../services/storage/user-preferences-types";
import {ModalService} from "../ui/modal/modal.service";
import {PublishModalComponent} from "../core/modals/publish-modal/publish-modal.component";
import {TabData} from "../core/workbox/tab-data.interface";
import {Observable} from "rxjs/Observable";

@Component({
    selector: "ct-tool-editor",
    styleUrls: ["./tool-editor.component.scss"],
    providers: [EditorInspectorService, ErrorBarService],
    templateUrl: "./tool-editor.component.html"
})
export class ToolEditorComponent extends DirectiveBase implements OnInit, OnDestroy, WorkboxTab, AfterViewInit {


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
    reportPanel: "validation" | "commandLinePreview" | undefined;

    /** Flag for validity of CWL document */
    isValidCWL = false;

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

    constructor(private cwlValidatorService: CwlSchemaValidationWorkerService,
                private formBuilder: FormBuilder,
                private inspector: EditorInspectorService,
                private statusBar: StatusBarService,
                private dataGateway: DataGatewayService,
                private modal: ModalService,
                private system: SystemService,
                private auth: AuthService,
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
            const newLabel = isDirty ? `${this.originalTabLabel} (modified)` : this.originalTabLabel;
            this.changeTabLabel(newLabel);
        });

        if (!this.data.isWritable) {
            this.codeEditorContent.disable();
        }

        // Whenever the editor content is changed, validate it using a JSON Schema.
        this.tracked = this.codeEditorContent
            .valueChanges
            .debounceTime(1000)
            .merge(this.priorityCodeUpdates)
            .distinctUntilChanged().subscribe(latestContent => {

                this.cwlValidatorService.validate(latestContent).then(r => {
                    if (!r.isValidCwl) {
                        // turn off loader and load document as code
                        if (!this.viewMode) {
                            this.viewMode = "code";
                        }

                        // this.isLoading  = false;
                        this.validation = r;
                        return r;
                    }

                    // load JSON to generate model
                    const json = Yaml.safeLoad(this.codeEditorContent.value, {
                        json: true
                    } as LoadOptions);

                    // should show prompt, but json is already reformatted
                    if (this.showReformatPrompt && json["sbg:modified"]) {
                        this.showReformatPrompt = false;
                    }

                    this.data.resolve(latestContent).subscribe((resolved) => {
                        // generate model and get command line parts
                        this.toolModel = CommandLineToolFactory.from(resolved as any, "document");
                        this.toolModel.onCommandLineResult((res) => {
                            this.commandLineParts.next(res);
                        });
                        this.toolModel.updateCommandLine();

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

                        this.isLoading = false;

                        const v = {
                            errors: this.toolModel.validation.errors,
                            warnings: this.toolModel.validation.warnings,
                            isValidatableCwl: true,
                            isValidCwl: true,
                            isValidJSON: true
                        };

                        this.validation = v;
                        this.isValidCWL = v.isValidCwl;
                        //
                        if (!this.viewMode) {
                            this.viewMode = "gui";
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

                        if (!this.viewMode) {
                            this.viewMode = "code";
                        }
                    });
                });

            });

        this.codeEditorContent.setValue(this.data.fileContent);
        this.tracked = this.priorityCodeUpdates.subscribe(txt => this.codeEditorContent.setValue(txt));

        this.statusBar.setControls(this.statusControls);
    }

    save() {

        const text = this.toolGroup.dirty ? this.getModelText() : this.codeEditorContent.value;

        this.dataGateway.saveFile(this.data.id, text).subscribe(save => {
            console.log("Saved", save);
            this.priorityCodeUpdates.next(save);
        }, err => {
            this.errorBarService.showError(`Unable to save Tool: ${err.message || err}`);
            console.log("Not saved", err);
        });
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
        fileWithoutRevision.pop();
        fileWithoutRevision.push(revisionNumber.toString());
        const fid = fileWithoutRevision.join("/");
        this.dataGateway.fetchFileContent(fid).subscribe(txt => {
            this.priorityCodeUpdates.next(txt);
            this.toolGroup.reset();
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
        const urlApp     = this.toolModel["sbgId"];
        const urlProject = urlApp.split("/").splice(0, 2).join("/");

        this.auth.connections.take(1).subscribe((cred: CredentialsEntry[]) => {
            const hash    = this.data.id.split("/")[0];
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
        setTimeout(() => {
            this.viewMode = tabName;

            if (tabName === "code" && this.toolGroup.dirty) {
                this.codeEditorContent.setValue(this.getModelText());
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
        const component = this.modal.fromComponent(PublishModalComponent, {
            title: "Publish an App",
            backdrop: true
        });

        component.appContent = this.toolModel.serialize();
    }

    registerOnTabLabelChange(update: (label: string) => void, originalLabel: string) {
        this.changeTabLabel   = update;
        this.originalTabLabel = originalLabel;
    }

}
