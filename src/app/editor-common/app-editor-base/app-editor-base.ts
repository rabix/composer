import {AfterViewInit, Injector, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef} from "@angular/core";
import {FormControl} from "@angular/forms";
import {CommandLineToolModel, WorkflowModel} from "cwlts/models";

import * as Yaml from "js-yaml";
import {LoadOptions} from "js-yaml";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
import {Store} from "@ngrx/store";
import {AppExecutionContext} from "../../../../electron/src/storage/types/executor-config";
import {AppMetaManager} from "../../core/app-meta/app-meta-manager";
import {APP_META_MANAGER} from "../../core/app-meta/app-meta-manager-factory";
import {CodeSwapService} from "../../core/code-content-service/code-content.service";
import {DataGatewayService} from "../../core/data-gateway/data-gateway.service";
import {AppHelper} from "../../core/helpers/AppHelper";
import {ErrorWrapper} from "../../core/helpers/error-wrapper";
import {ClosingDirtyAppsModalComponent} from "../../core/modals/closing-dirty-apps/closing-dirty-apps-modal.component";
import {ProceedToEditingModalComponent} from "../../core/modals/proceed-to-editing-modal/proceed-to-editing-modal.component";
import {PublishModalComponent} from "../../core/modals/publish-modal/publish-modal.component";
import {AppTabData} from "../../core/workbox/app-tab-data";
import {WorkboxService} from "../../core/workbox/workbox.service";
import {FileRepositoryService} from "../../file-repository/file-repository.service";
import {NotificationBarService} from "../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {StatusControlProvider} from "../../layout/status-bar/status-control-provider.interface";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {ExportAppService} from "../../services/export-app/export-app.service";
import {ModalService} from "../../ui/modal/modal.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {AppExecutionContextModalComponent} from "../app-execution-context-modal/app-execution-context-modal.component";
import {AppExportModalComponent} from "../app-export-modal/app-export-modal.component";
import {AppValidatorService, AppValidityState} from "../app-validator/app-validator.service";
import {PlatformAppService} from "../components/platform-app-common/platform-app.service";
import {RevisionListComponent} from "../components/revision-list/revision-list.component";
import {GraphJobEditorComponent} from "../../job-editor/graph-job-editor/graph-job-editor.component";
import {EditorInspectorService} from "../inspector/editor-inspector.service";
import {JobImportExportComponent} from "../job-import-export/job-import-export.component";
import {AppUpdateService} from "../services/app-update/app-updating.service";
import {APP_SAVER_TOKEN, AppSaver} from "../services/app-saving/app-saver.interface";
import {CommonReportPanelComponent} from "../template-common/common-preview-panel/common-report-panel.component";
import {WorkflowEditorComponent} from "../../workflow-editor/workflow-editor.component";
import {ExecutorService} from "../../executor-service/executor.service";
import {ExecutorService2} from "../../execution/services/executor/executor.service";
import {AuthService} from "../../auth/auth.service";
import {ExecutionStopAction} from "../../execution/actions/execution.actions";
import {switchMap, flatMap, finalize, catchError} from "rxjs/operators";


export abstract class AppEditorBase extends DirectiveBase implements StatusControlProvider, OnInit, AfterViewInit {

    @Input()
    tabData: AppTabData;

    @Input()
    showInspector = false;

    @Input()
    viewMode: "code" | string;

    @ViewChild(RevisionListComponent)
    revisionList: RevisionListComponent;

    validationState: AppValidityState;

    dataModel: CommandLineToolModel | WorkflowModel;

    /** Flag to indicate if document is in Dirty state (when user interacts/modifies) */
    isDirty = false;

    /** Flag to indicate the document is loading */
    isLoading = true;

    /** Flag to indicate if CWL validation is in progress */
    isValidatingCWL = false;

    reportPanel: "validation" | string;

    /** Flag to indicate if resolving content is in progress */
    isResolvingContent = false;

    /** Flag for validity of CWL document */
    isValidCWL = false;

    /** Error message about app availability */
    unavailableError;

    codeEditorContent = new FormControl(undefined);

    priorityCodeUpdates = new Subject<string>();

    resolveDocumentChanges = new Subject<string>();

    isReadonly = false;

    isResolved = false;

    savingDisabled = true;

    isUnlockable = null;

    isExecuting = false;

    executionQueue = new Subject<any>();

    /** TODO: Check where this is populated */
    executionJob: Object;

    @ViewChild("reportPanelComponent", {read: CommonReportPanelComponent})
    private reportPanelComponent: CommonReportPanelComponent;

    /** Template of the status controls that will be shown in the status bar */
    @ViewChild("statusControls")
    protected statusControls: TemplateRef<any>;

    @ViewChild("inspector", {read: ViewContainerRef})
    protected inspectorHostView: ViewContainerRef;

    @ViewChild(GraphJobEditorComponent)
    protected jobEditor: GraphJobEditorComponent;

    protected appSavingService: AppSaver;

    private modelCreated = false;

    /**
     * Used as a hack flag so we can recreate the model on changes from non-gui mode,
     * or from any mode when switching revisions.
     * Please don't use it elsewhere unless discussing the added complexity of flag switching.
     *
     * {@link revisionHackFlagSwitchOff}
     * {@link revisionHackFlagSwitchOn}
     */
    protected revisionChangingInProgress = false;

    /**
     * Show modal when app is dirty when changing revisions to prevent loosing changes
     */
    showModalIfAppIsDirtyBound = this.showModalIfAppIsDirty.bind(this);

    constructor(protected statusBar: StatusBarService,
                protected notificationBar: NotificationBarService,
                protected modal: ModalService,
                protected inspector: EditorInspectorService,
                protected dataGateway: DataGatewayService,
                protected injector: Injector,
                protected appValidator: AppValidatorService,
                protected codeSwapService: CodeSwapService,
                protected platformAppService: PlatformAppService,
                protected platformRepository: PlatformRepositoryService,
                protected localRepository: LocalRepositoryService,
                protected fileRepository: FileRepositoryService,
                protected workbox: WorkboxService,
                protected exportApp: ExportAppService,
                public store: Store<any>,
                protected auth: AuthService,
                public executor: ExecutorService,
                protected updateService: AppUpdateService) {

        super();

    }

    ngOnInit() {

        this.inspector.inspectedObject
            .map(obj => obj !== undefined)
            .subscribeTracked(this, show => this.showInspector = show);

        // Get the app saver from the injector
        this.appSavingService = this.injector.get(APP_SAVER_TOKEN) as AppSaver;

        // Set this app's ID to the code content service
        this.codeSwapService.appID = this.tabData.id;

        this.codeEditorContent.valueChanges.subscribeTracked(this, content => this.codeSwapService.codeContent.next(content));

        /** Replay subject used here because withLatestFrom operator did not work well for validationStateChanges stream */
        const externalCodeChanges = new ReplaySubject(1);

        /** Changes to the code that did not come from user's typing. */
        Observable.merge(this.tabData.fileContent, this.priorityCodeUpdates).distinctUntilChanged().subscribeTracked(this, externalCodeChanges);

        /**
         * On user interactions (changes) set app state to Dirty - skip the first validation, which is called
         *  after resolving on document load.
         */
        this.codeEditorContent.valueChanges.distinctUntilChanged().skip(1).filter(() => this.revisionChangingInProgress === false).subscribeTracked(this, () => {
            this.setAppDirtyState(true);
        }, (err) => {
            console.warn("Error on dirty checking stream", err);
        });

        /** We skip validation for first code changes in local apps because initial resolve will call validation */
        const codeChangesToValidate = Observable.merge(this.resolveDocumentChanges,
            this.codeEditorContent.valueChanges.debounceTime(300).skip(this.tabData.dataSource === "local" ? 1 : 0).distinctUntilChanged());

        /** Attach a CWL validator to code updates and observe the validation state changes. */
        const schemaValidation = this.appValidator.createValidator(codeChangesToValidate).map((state: AppValidityState) => {
            if (state.isValidCWL && this.dataModel) {
                state.errors   = state.errors.concat(this.dataModel.errors);
                state.warnings = state.warnings.concat(this.dataModel.warnings);
            }

            return state;
        }).share();

        const validationCompletion = schemaValidation.filter(state => !state.isPending);

        /** Get the end of first validation check */
        const firstValidationEnd = validationCompletion.take(1);

        /**
         * For each code change from outside the ace editor, update the content of the editor form control.
         * Check for RDF as well
         */
        externalCodeChanges.subscribeTracked(this, (code: string) => {
            // Exteral code changes should update the internal state as well
            this.codeEditorContent.setValue(code);

        }, (err) => {
            this.unavailableError = new ErrorWrapper(err).toString() || "Error occurred while fetching app";
            this.isLoading        = false;
        });

        /**
         * We will store the validation state from the validator to avoid excessive template subscribers.
         * Also, we will at some times override the data from the state validity with model validation.
         */
        schemaValidation.subscribe(state => {
            this.validationState = state;
        }, (err) => {
            console.warn("Error on schema validation", err);
        });

        /**
         * After the initial validation, external code changes should resolve and recreate the model.
         * The issue is that model creation registers a validation callback that overrides validation state
         * provided by the {@link schemaValidation} stream. For the first input, however, the app might not be
         * validated yet, so we should not create the model before the first validation ends.
         * We therefore skip the input until the first validation, but need to preserve the latest
         * code change that might have been there in the meantime so we know what to use as the base for
         * the model creation.
         */

        const validationStateChanges = firstValidationEnd.withLatestFrom(externalCodeChanges)
            .switchMap((data: [AppValidityState, string]) => {
                const [validationState] = data;
                return validationCompletion
                    .startWith(validationState)
                    .map(state => [this.codeEditorContent.value, state]);
            })
            .withLatestFrom(
                AppHelper.isLocal(this.tabData.id) ? Observable.of(true)
                    : this.platformRepository.getAppMeta(this.tabData.id, "swapUnlocked"),
                (outer, inner) => [...outer, inner]).share();

        validationStateChanges.subscribeTracked(this, (data: [string, AppValidityState, boolean]) => {
            const [code, validation, unlocked] = data;

            this.isLoading = false;

            if (!validation.isValidCWL) {
                this.viewMode = "code";
                return;
            }

            // If app is not initially resolvable and user proceeds to edit, we have to inform the user to
            // manually click resolve to fix issues after validation has been passed
            if (this.tabData.dataSource === "local" && !this.dataModel) {
                this.validationState.warnings = this.validationState.warnings.concat({
                    loc: "document",
                    type: "error",
                    message: "No JSON schema issues. Resolve to enable other editor tabs."
                });
            }

            // We have to resolve after validation if app is a workflow with invalid steps
            const isWorkflowWithInvalidSteps = this instanceof WorkflowEditorComponent && (<WorkflowEditorComponent>this).invalidSteps.length;
            const continuation: Promise<any> = this.tabData.dataSource === "local" && isWorkflowWithInvalidSteps ?
                this.resolveToModel(code) : Promise.resolve();

            continuation.then(() => {
                /**
                 * @name revisionHackFlagSwitchOff
                 * @see revisionChangingInProgress
                 * */
                this.revisionChangingInProgress = false;

                // copyOf property really matters only if we are working with the latest revision
                // otherwise, apps detached from copy state at some revision will still show locked state
                // and notification when switched to an older revision
                const props             = (this.dataModel && this.dataModel.customProps) || {};
                const hasCopyOfProperty = props["sbg:copyOf"] && (~~props["sbg:revision"] === ~~props["sbg:latestRevision"]);

                if (!this.tabData.isWritable || this.tabData.dataSource === "local") {
                    this.isUnlockable = false;
                } else if (hasCopyOfProperty && !unlocked) {

                    const originalApp = this.dataModel.customProps["sbg:copyOf"];
                    this.notificationBar.showNotification(`This app is a read-only copy of ${originalApp}`, {
                        type: "info"
                    });
                    this.isUnlockable = true;
                }

                const isUnlockedAndUnlockableCopy = this.isUnlockable && hasCopyOfProperty && !unlocked;

                if (!this.tabData.isWritable || isUnlockedAndUnlockableCopy) {
                    this.toggleLock(true);
                }
            }, () => console.warn);
        }, (err) => {
            console.warn("Error on validation state changes", err);
        });

        /** When the first validation ends, turn off the loader and determine which view we can show. Invalid app forces code view */
        firstValidationEnd.subscribe(state => {
            if (this.tabData.dataSource === "local") {
                this.viewMode = state.isValidCWL && this.isResolved ? this.getPreferredTab() : "code";
            } else {
                this.viewMode = state.isValidCWL ? this.getPreferredTab() : "code";
            }
            this.reportPanel = state.isValidCWL ? this.getPreferredReportPanel() : this.reportPanel;
        }, (err) => {
            console.warn("Error on first validation end", err);
        });

        if (AppHelper.isLocal(this.tabData.id)) {
            this.localRepository.getAppMeta(this.tabData.id, "isDirty").subscribeTracked(this, (isModified) => {
                this.isDirty = !!isModified;
            });
        } else {
            this.platformRepository.getAppMeta(this.tabData.id, "isDirty").subscribeTracked(this, (isModified) => {
                this.isDirty = !!isModified;
            });
        }

        if (this.tabData.dataSource !== "local") {
            this.updateService.update
                .filter(data => AppHelper.getRevisionlessID(data.id || "") === this.tabData.id)
                .subscribeTracked(this, data => {
                    this.dataModel.customProps["sbg:revisionsInfo"] = data.app["sbg:revisionsInfo"];
                    this.resolveAfterModelAndCodeSync().then(() => {
                        this.setAppDirtyState(false);
                    }, err => console.warn);
                });
        }
    }

    setAppDirtyState(isModified: boolean) {

        if (AppHelper.isLocal(this.tabData.id)) {
            this.localRepository.patchAppMeta(this.tabData.id, "isDirty", isModified);
        } else {
            this.platformRepository.patchAppMeta(this.tabData.id, "isDirty", isModified);
        }
    }

    save(): void {

        const appName = this.tabData.id;

        const proc = this.statusBar.startProcess(`Saving ${appName}`);
        const text = this.viewMode === "code" ? this.codeEditorContent.value : this.getModelText();

        this.appSavingService
            .save(this.tabData.id, text)
            .then(update => {

                this.codeEditorContent.setValue(update);

                if (this.tabData.dataSource !== "local") {
                    this.revisionChangingInProgress = true;
                    this.resolveToModel(update);
                }

                this.priorityCodeUpdates.next(update);

                // After app is saved, app state is not Dirty any more
                this.setAppDirtyState(false);

                this.statusBar.stopProcess(proc, `Saved: ${appName}`);

                if (this.validationState.isValidCWL) {
                    const app = Yaml.safeLoad(update, {json: true} as LoadOptions);
                    const id = this.tabData.dataSource === "local" ? this.tabData.id : app["sbg:id"];
                    this.updateService.updateApps({id: id, app: app});
                } else {
                    this.updateService.updateApps({id: this.tabData.id, app: null});
                }

            }, err => {
                if (!err || !err.message) {
                    this.statusBar.stopProcess(proc);
                    return;
                }

                this.notificationBar.showNotification(`Saving failed: ${err.message}`);
                this.statusBar.stopProcess(proc, `Could not save ${appName} (${err.message})`);
            });
    }

    publish(): void {

        if (!this.validationState.isValidCWL) {
            this.notificationBar.showNotification(`Cannot push this app because because it's doesn't match the proper JSON schema`);
            return;
        }
        this.resolveAfterModelAndCodeSync().then(() => {
            const modal = this.modal.fromComponent(PublishModalComponent, "Push an App");
            modal.appID = this.dataModel.id;
            modal.appContent = this.getModelText(true, true);

            modal.published.take(1).subscribeTracked(this, obj => {
                this.updateService.updateApps({id: obj.app["sbg:id"], app: obj.app});

                const tab = this.workbox.getOrCreateAppTab({
                    id: AppHelper.getRevisionlessID(obj.id),
                    type: this.dataModel.class,
                    label: modal.inputForm.get("id").value,
                    isWritable: true,
                    language: "json"

                });
                this.workbox.openTab(tab);
            });
        });
    }

    provideStatusControls(): TemplateRef<any> {
        return this.statusControls;
    }

    ngAfterViewInit() {
        this.inspector.setHostView(this.inspectorHostView);
        super.ngAfterViewInit();

        this.bindExecutionQueue();
    }

    unlockEditing(): Promise<boolean> {
        const label = (this.dataModel && this.dataModel.label) || "Unnamed App";

        const modal = this.modal.fromComponent(ProceedToEditingModalComponent, {
            title: `Edit ${label}?`,
        });

        modal.appName = label;
        return modal.response.take(1).toPromise().then(response => {
            this.toggleLock(false);
            return response;
        }, err => console.warn);
    }

    /**
     * Tells whether GUI tabs are enabled
     */
    tabsUnlocked(): boolean {
        let codeCondition = this.validationState && this.validationState.isValidCWL && !this.isResolvingContent &&
            !this.isValidatingCWL && (this.tabData.dataSource === "local" ? this.isResolved : true);
        if (this.viewMode === "code") {
            return codeCondition;
        }

        return codeCondition && this.dataModel !== undefined;
    }

    appIsSavable(): boolean {
        if (this.tabData.dataSource === "local") {
            return true;
        }

        /** Bound to lock state by accident, not intention */
        return this.tabsUnlocked() && !this.isReadonly;
    }

    appIsResolvable(): boolean {
        return this.validationState && this.validationState.isValidCWL &&
            !this.isResolvingContent && !this.isValidatingCWL;
    }

    appIsPublishable(): boolean {
        /** Bound to lock state by accident, not intention */
        return this.tabsUnlocked();
    }

    appIsRunnable() {
        return this.dataModel !== undefined;
    }

    openRevision(revisionNumber: number | string | any): Promise<any> {

        const fid = AppHelper.getAppIDWithRevision(this.tabData.id, revisionNumber);

        /** @name revisionHackFlagSwitchOn */
        this.revisionChangingInProgress = true;

        return this.dataGateway.fetchFileContent(fid).take(1)
            .toPromise().then(result => {
                this.priorityCodeUpdates.next(result);

                this.setAppDirtyState(false);

                return result;
            }).catch(err => {
                this.revisionChangingInProgress   = false;
                this.revisionList.loadingRevision = false;
                this.notificationBar.showNotification("Cannot open revision. " + new ErrorWrapper(err));
            });
    }

    switchTab(tabName): void {

        if (!tabName) {
            return;
        }

        /** If switching to code mode, serialize the model first and update the editor text */
        if (this.viewMode !== "code" && tabName === "code") {

            if (this.isDirty) {
                /** If switching to code mode, serialize only if there are changes made (dirty state) */
                this.priorityCodeUpdates.next(this.getModelText());
            }

            this.viewMode = tabName;
            return;
        }

        /** If going from code mode to gui, resolve the content first */
        if ((this.viewMode === "code" || !this.viewMode) && tabName !== "code") {

            // Trick that will change reference for tabselector highlight line (to reset it to a Code mode if resolve fails)
            this.viewMode = undefined;
            this.resolveToModel(this.codeEditorContent.value).then(() => {
                this.viewMode = tabName;
            }, () => {
                this.viewMode = "code";
            });
            return;
        }

        // If changing from|to mode that is not a Code mode, just switch
        this.viewMode = tabName;
    }

    resolveCurrentContent(): void {
        this.resolveToModel(this.codeEditorContent.value).then(() => {
        }, err => console.warn);
    }

    toggleReport(panel: string, value?: boolean) {
        if (value === true) {
            this.reportPanel = panel;
        } else {
            this.reportPanel = this.reportPanel === panel ? undefined : panel;

        }

        // Force browser reflow, heights and scroll bar size gets inconsistent otherwise
        setTimeout(() => window.dispatchEvent(new Event("resize")));
    }

    openOnPlatform(appID: string) {
        this.platformAppService.openOnPlatform(appID);
    }

    editRunConfiguration() {
        const appID     = this.tabData.id;
        const appConfig = this.executor.getAppConfig(appID).take(1);

        appConfig.take(1).subscribeTracked(this, (context) => {

            const modal = this.modal.fromComponent(AppExecutionContextModalComponent, {
                title: "Set Execution Parameters"
            });

            modal.context = context;
            modal.appID   = appID;

            modal.onSubmit = (raw) => {
                this.executor.setAppConfig(appID, raw);
                this.modal.close();
            };

            modal.onCancel = () => {
                this.modal.close();
            };
        });
    }

    scheduleExecution() {
        this.executionQueue.next(true);
    }

    /**
     * Serializes model to text. It also adds sbg:modified flag to indicate
     * the text has been formatted by the GUI editor.
     *
     */
    protected getModelText(forceJSON = false, embed?: boolean): string {

        const modelObject = this.dataModel.serialize();

        if (this.tabData.language === "json" || this.tabData.dataSource === "app" || forceJSON) {
            return JSON.stringify(modelObject, null, 4);
        }

        return Yaml.dump(modelObject);
    }

    protected dumpSwap(): void {
        if (this.viewMode !== "code") {
            this.codeEditorContent.setValue(this.getModelText());
        }

        const modelStateString = this.codeEditorContent.value;
        this.codeSwapService.codeContent.next(modelStateString);
    }

    protected resolveAfterModelAndCodeSync(): Promise<any> {

        if (this.viewMode === "code") {
            const codeVal = this.codeEditorContent.value;

            return this.resolveToModel(codeVal);
        }

        return this.resolveContent(this.getModelText()).then((data: Object) => {
            const serialized = this.tabData.language === "json" || this.tabData.dataSource === "app" ?
                JSON.stringify(data, null, 4) : Yaml.dump(data);
            this.codeEditorContent.setValue(serialized);
            return data;
        }, console.warn);
    }

    protected afterModelValidation(): void {
        this.validationState = {
            ...this.validationState,
            errors: this.dataModel.errors || [],
            warnings: this.dataModel.warnings || [],
            isPending: false
        };
    }

    protected applyModelValidity() {

    }

    /**
     * Resolve RDF code content and return a promise of the resolved content
     * Side effect: recreate a tool model from resolved code
     * @param content
     * @returns Promise of resolved code content
     */
    protected resolveToModel(content: string): Promise<Object> {
        const appMightBeRDF = this.tabData.dataSource === "local";

        const tryModelCreation = (text, resolve, reject) => {
            try {
                this.recreateModel(text); // throws exception when generating graph
                this.afterModelCreated(!this.modelCreated);
                this.modelCreated = true;

                resolve(text);
            } catch (err) {
                reject(new Error("Model error: " + err.message));
            }
        };

        return new Promise((resolve, reject) => {
            if (appMightBeRDF) {
                const statusMessage = this.statusBar.startProcess("Resolving RDF Schema...");

                this.resolveContent(content).then(resolved => {
                    tryModelCreation(resolved, resolve, reject);
                    this.statusBar.stopProcess(statusMessage, "");

                }, err => {
                    this.statusBar.stopProcess(statusMessage, "Failed to resolve RDF schema.");
                    reject(new Error("RDF resolution error: " + err.message));
                });

                return;
            }

            const json = Yaml.safeLoad(content, {json: true} as LoadOptions);

            tryModelCreation(json, resolve, reject);

        }).then(result => {
            return result;
        }, err => {
            throw err;
        });
    }

    protected abstract recreateModel(json: Object): void;

    protected toggleLock(locked: boolean): void {

        if (locked === false) {
            this.platformRepository.patchAppMeta(this.tabData.id, "swapUnlocked", true);

            this.isUnlockable = false;
        }

        this.isReadonly = locked;
        if (locked) {
            this.codeEditorContent.disable({emitEvent: false});

            return;
        }

        this.codeEditorContent.enable({emitEvent: false});

    }

    protected abstract getPreferredTab(): string;

    protected getPreferredReportPanel(): string {
        return undefined;
    }

    protected afterModelCreated(isFirstCreation: boolean): void {
    }

    protected updateSavingAvailability() {

        if (this.tabData.dataSource === "local") {
            this.savingDisabled = false;
            return;
        }

        this.savingDisabled = !(this.isValidatingCWL || !!this.unavailableError || !this.dataModel);
    }

    protected resolveContent(content: string): Promise<Object> {
        this.isResolvingContent = true;
        return this.tabData.resolve(content).toPromise().then(resolved => {
            this.resolveDocumentChanges.next(JSON.stringify(resolved));
            this.isResolvingContent = false;
            this.isResolved = true;
            return resolved;
        }, err => {
            this.isResolvingContent = false;
            this.isResolved = false;

            this.notificationBar.showNotification(err.message || "An error has occurred");

            if (!this.validationState) {
                this.validationState = {
                    isPending: false,
                    errors: [],
                    warnings: []
                } as AppValidityState;

                this.isLoading = false;
            }

            this.validationState.isValidCWL = false;
            this.validationState.errors     = [{
                loc: "document",
                type: "error",
                message: err.message
            }];
            this.validationState.warnings   = [];

            this.viewMode = "code";
            throw err;
        });
    }

    private getExecutionContext(): Observable<AppExecutionContext | null> {

        const appID = this.tabData.id;

        return this.executor.getAppConfig(appID).take(1)
            .switchMap((context: AppExecutionContext) => {

                // If we have job path set, we can proceed with execution
                if (context) {
                    return Observable.of(context);
                }

                // Otherwise, we have to obtain job path
                const modal = this.modal.fromComponent(AppExecutionContextModalComponent, "Set Execution Parameters");

                modal.confirmLabel = "Run";
                modal.context      = context;
                modal.appID        = appID;

                return new Observable(observer => {
                    modal.onSubmit = (raw) => {
                        observer.next(raw);
                        observer.complete();
                        this.modal.close();
                        this.executor.setAppConfig(appID, raw);
                    };

                    modal.onCancel = () => {
                        observer.next(null);
                        observer.complete();
                        this.modal.close();
                        this.executor.setAppConfig(appID, null);
                    };
                });

            }).take(1).filter(v => !!v) as Observable<AppExecutionContext>;
    }

    private bindExecutionQueue() {

        this.executionQueue.pipe(
            switchMap(() => this.runOnExecutor().pipe(
                finalize(() => this.isExecuting = false),
                catchError(() => Observable.empty())
            ))
        ).subscribeTracked(this, () => void 0);

        this.executionQueue.pipe(
            flatMap(() => {
                const metaManager = this.injector.get(APP_META_MANAGER) as AppMetaManager;
                return metaManager.getAppMeta("job").take(1);
            })
        ).subscribeTracked(this, () => {
            this.toggleReport("execution", true);
            this.isExecuting = true;
        });
    }

    stopExecution() {
        this.store.dispatch(new ExecutionStopAction(this.tabData.id));
    }

    private runOnExecutor(): Observable<string | Object> {

        const metaManager    = this.injector.get<AppMetaManager>(APP_META_MANAGER);
        const executorConfig = this.localRepository.getExecutorConfig();
        const job            = metaManager.getAppMeta("job");
        const user           = this.auth.getActive().map(user => user ? user.id : "local");

        return Observable.combineLatest(job, executorConfig, user).take(1).switchMap(data => {

            const [job, executorConfig, user] = data;

            const appID        = this.tabData.id;
            const executorPath = executorConfig.choice === "bundled" ? undefined : executorConfig.path;

            const executor = this.injector.get(ExecutorService2);

            const appIsLocal = AppHelper.isLocal(appID);

            const outDir = executor.makeOutputDirectoryName(executorConfig.outDir, appID, appIsLocal ? "local" : user);

            return executor.execute(appID, this.dataModel, job, executorPath, {outDir}).finally(() => {
                this.fileRepository.reloadPath(outDir);
            });
        });

    }

    showModalIfAppIsDirty(): Promise<boolean> {

        return new Promise((resolve, reject) => {

            if (!this.isDirty) {
                return resolve(true);
            }

            const modal = this.modal.fromComponent(ClosingDirtyAppsModalComponent, {
                title: "Change revision"
            });

            modal.confirmationLabel = "Save";
            modal.discardLabel      = "Change without saving";

            modal.decision.take(1).subscribe((result) => {

                if (result) {
                    this.modal.close();
                    this.save();
                    reject();
                } else {
                    resolve(true);
                    this.modal.close();
                }
            });

        });

    }

    importJob() {
        const metaManager = this.injector.get<AppMetaManager>(APP_META_MANAGER);
        const comp        = this.modal.fromComponent(JobImportExportComponent, "Import Job");
        comp.appID        = this.tabData.id;
        comp.action       = "import";

        comp.import.take(1).subscribeTracked(this, (jobObject) => {
            metaManager.patchAppMeta("job", jobObject);
            this.modal.close();
            if (this.jobEditor) {
                this.jobEditor.updateJob(jobObject);
            }

        });

    }

    exportJob() {
        const metaManager = this.injector.get<AppMetaManager>(APP_META_MANAGER);

        metaManager.getAppMeta("job").take(1).subscribeTracked(this, job => {
            const comp  = this.modal.fromComponent(JobImportExportComponent, "Export Job");
            comp.action = "export";
            comp.appID  = this.tabData.id;
            comp.job    = Object.prototype.isPrototypeOf(job) ? job : {};
        });
    }

    exportAppInFormat(format: "yaml" | "json") {
        const serialized = this.dataModel instanceof WorkflowModel
            ? this.dataModel.serializeEmbedded(false) : this.dataModel.serialize();

        this.exportApp.chooseExportFile(this.tabData.id, serialized, format);
    }

    isWorkflowModel() {
        if (this.dataModel) {
            return this.dataModel instanceof WorkflowModel;
        }
    }
}
