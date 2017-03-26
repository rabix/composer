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
import {BehaviorSubject, ReplaySubject, Subject} from "rxjs/Rx";
import {WorkboxTab} from "../core/workbox/workbox-tab.interface";
import {
    CwlSchemaValidationWorkerService,
    ValidationResponse
} from "../editor-common/cwl-schema-validation-worker/cwl-schema-validation-worker.service";
import {EditorInspectorService} from "../editor-common/inspector/editor-inspector.service";
import {StatusBarService} from "../layout/status-bar/status-bar.service";
import {SystemService} from "../platform-providers/system.service";
import {PlatformAPI} from "../services/api/platforms/platform-api.service";
import {SettingsService} from "../services/settings/settings.service";
import {UserPreferencesService} from "../services/storage/user-preferences.service";
import {DataEntrySource} from "../sources/common/interfaces";
import {ModalService} from "../ui/modal/modal.service";
import {DirectiveBase} from "../util/directive-base/directive-base";
import LoadOptions = jsyaml.LoadOptions;
import {AppTabData} from "../core/workbox/app-tab-data";
import {DataGatewayService} from "../core/data-gateway/data-gateway.service";
import {ErrorBarService} from "../layout/error-bar/error-bar.service";

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
    isLoading = false;

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

    codeEditorContent = new FormControl(undefined);

    priorityCodeUpdates = new Subject();

    constructor(private cwlValidatorService: CwlSchemaValidationWorkerService,
                private formBuilder: FormBuilder,
                private inspector: EditorInspectorService,
                private statusBar: StatusBarService,
                private dataGateway: DataGatewayService,
                private platformAPI: PlatformAPI,
                private system: SystemService,
                private settings: SettingsService,
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
                    if (this.showReformatPrompt && json["rbx:modified"]) {
                        this.showReformatPrompt = false;
                    }

                    this.data.resolve(latestContent).subscribe((resolved) => {
                        // generate model and get command line parts
                        this.toolModel = CommandLineToolFactory.from(resolved as any, "document");
                        // this.toolModel.onCommandLineResult((res) => {
                        //     this.commandLineParts.next(res);
                        // });
                        // this.toolModel.updateCommandLine();

                        // update validation stream on model validation updates

                        // this.toolModel.setValidationCallback((res: Validation) => {
                        //     this.validation = {
                        //         errors: res.errors,
                        //         warnings: res.warnings,
                        //         isValidatableCwl: true,
                        //         isValidCwl: true,
                        //         isValidJSON: true
                        //     };
                        // });

                        this.toolModel.validate();

                        // load document in GUI and turn off loader, only if loader was active
                        // this.isLoading = false;

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
                    }, (err) => {
                        // this.isLoading  = false;
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

        console.warn("Reimplement saving");

        this.dataGateway.saveFile(this.data.id, this.getModelText()).subscribe(save => {
            console.log("Saved", save);
        }, err => {
            console.log("Not saved", err);
        });
        // const text = this.toolGroup.dirty ? this.getModelText() : this.codeEditorContent.value;
        //
        // // For local files, just save and that's it
        // if (this.data.data.source === "local") {
        //     const path = this.data.data.path;
        //
        //     const statusID = this.statusBar.startProcess(`Saving ${path}...`, `Saved ${path}`);
        //     this.data.data.save(text).subscribe(() => {
        //         this.statusBar.stopProcess(statusID);
        //     });
        //     return;
        // }
        //
        // // For Platform files, we need to ask for a revision note
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
     * Serializes model to text. It also adds rbx:modified flag to indicate
     * the text has been formatted by the GUI editor
     */
    private getModelText(): string {
        const modelObject = Object.assign(this.toolModel.serialize(), {"rbx:modified": true});

        return this.data.language === "json" ? JSON.stringify(modelObject, null, 4) : Yaml.dump(modelObject);
    }

    toggleReport(panel: "validation" | "commandLinePreview") {
        this.reportPanel = this.reportPanel === panel ? undefined : panel;
    }

    openRevision(revisionNumber: number) {
        this.platformAPI.getAppCWL(this.data.parsedContent["sbg:id"], revisionNumber).subscribe(txt => {
            this.priorityCodeUpdates.next(txt);
            this.toolGroup.reset();
        });
    }

    onJobUpdate(job) {
        this.toolModel.setJob(job);
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

        this.settings.platformConfiguration.first().map(settings => settings.url).subscribe((url) => {
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
}
