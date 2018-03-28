import {AfterViewInit, Injector, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef} from "@angular/core";
import {FormControl} from "@angular/forms";
import {CommandLineToolModel, WorkflowModel} from "cwlts/models";

import * as Yaml from "js-yaml";
import {LoadOptions} from "js-yaml";
import {Observable} from "rxjs/Observable";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
import {AppMetaManager} from "../../core/app-meta/app-meta-manager";
import {AppMetaManagerToken} from "../../core/app-meta/app-meta-manager-factory";
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
import {AppValidatorService, AppValidityState} from "../app-validator/app-validator.service";
import {PlatformAppService} from "../components/platform-app-common/platform-app.service";
import {RevisionListComponent} from "../components/revision-list/revision-list.component";
import {GraphJobEditorComponent} from "../../job-editor/graph-job-editor/graph-job-editor.component";
import {EditorInspectorService} from "../inspector/editor-inspector.service";
import {JobImportExportComponent} from "../job-import-export/job-import-export.component";
import {AppSaverToken, AppSaver} from "../services/app-saving/app-saver.interface";
import {CommonReportPanelComponent} from "../template-common/common-preview-panel/common-report-panel.component";
import {Store} from "@ngrx/store";
import {ExecutorService} from "../../executor-service/executor.service";
import {ExecutorService2} from "../../execution/services/executor/executor.service";
import {AuthService} from "../../auth/auth.service";
import {ExecutionStopAction} from "../../execution/actions/execution.actions";
import {
    switchMap,
    flatMap,
    finalize,
    catchError,
    distinctUntilChanged,
    map,
    skip,
    filter,
    debounceTime,
    share,
    take,
    withLatestFrom,
    startWith
} from "rxjs/operators";
import {ensureAbsolutePaths} from "../../job-editor/utilities/path-resolver";
import {merge} from "rxjs/observable/merge";
import {of} from "rxjs/observable/of";
import {empty} from "rxjs/observable/empty";
import {combineLatest} from "rxjs/observable/combineLatest";
import {fixJobFilePaths} from "../utilities/imported-job-parser/imported-job-parser";
import {serializeModel} from "../utilities/model-serializer/model-serializer";

const path = require("path");

export abstract class AppEditorBase extends DirectiveBase implements StatusControlProvider, OnInit, AfterViewInit {

    @Input()
    tabData: AppTabData;

    @Input()
    showInspector = false;

    @Input()
    viewMode: "code" | string;

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

    isReadonly = false;

    savingDisabled = true;

    isUnlockable = null;

    isExecuting = false;

    executionQueue = new Subject<any>();

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

    showModalIfAppIsDirtyBound = this.showModalIfAppIsDirty.bind(this);

    /**
     * Used as a hack flag so we can recreate the model on changes from non-gui mode,
     * or from any mode when switching revisions.
     * Please don't use it elsewhere unless discussing the added complexity of flag switching.
     *
     * {@link revisionHackFlagSwitchOff}
     * {@link revisionHackFlagSwitchOn}
     */
    protected revisionChangingInProgress = false;

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
                public executor: ExecutorService) {

        super();

    }

    ngOnInit() {

        this.inspector.inspectedObject.pipe(
            map(obj => obj !== undefined)
        ).subscribeTracked(this, show => this.showInspector = show);

        // Get the app saver from the injector
        this.appSavingService = this.injector.get(AppSaverToken) as AppSaver;

        // Set this app's ID to the code content service
        this.codeSwapService.appID = this.tabData.id;

        const codeEditorContentDistinctChanges = this.codeEditorContent.valueChanges.pipe(distinctUntilChanged());

        codeEditorContentDistinctChanges.subscribeTracked(this, content => this.codeSwapService.codeContent.next(content));

        /** Replay subject used here because withLatestFrom operator did not work well for validationStateChanges stream */
        const externalCodeChanges = new ReplaySubject(1);

        /** Changes to the code that did not come from user's typing. */
        merge(this.tabData.fileContent, this.priorityCodeUpdates).pipe(
            distinctUntilChanged()
        ).subscribeTracked(this, externalCodeChanges);

        /** On user interactions (changes) set app state to Dirty */
        codeEditorContentDistinctChanges.pipe(
            skip(1),
            filter(() => this.revisionChangingInProgress === false)
        ).subscribeTracked(this,
            () => this.setAppDirtyState(true),
            err => console.warn("Error on dirty checking stream", err)
        );

        /** Changes to the code from user's typing, slightly debounced */
        const codeEditorChanges = codeEditorContentDistinctChanges.pipe(
            debounceTime(300),
            distinctUntilChanged()
        );

        /** Observe all code changes */
        const allCodeChanges = merge(externalCodeChanges, codeEditorChanges).pipe(
            distinctUntilChanged()
        );

        /** Attach a CWL validator to code updates and observe the validation state changes. */
        const schemaValidation = this.appValidator.createValidator(allCodeChanges).pipe(
            map((state: AppValidityState) => {
                if (state.isValidCWL && this.dataModel) {
                    state.errors   = state.errors.concat(this.dataModel.errors);
                    state.warnings = state.warnings.concat(this.dataModel.warnings);
                }

                return state;
            }),
            share()
        );

        const validationCompletion = schemaValidation.pipe(
            filter(state => !state.isPending)
        );

        /** Get the end of first validation check */
        const firstValidationEnd = validationCompletion.pipe(
            take(1)
        );

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

        const validationStateChanges = firstValidationEnd.pipe(
            withLatestFrom(externalCodeChanges),
            switchMap((data: [AppValidityState, string]) => validationCompletion.pipe(
                startWith(data[0]),
                map(state => [this.codeEditorContent.value, state])
            )),
            withLatestFrom(
                AppHelper.isLocal(this.tabData.id) ? of(true) : this.platformRepository.getAppMeta(this.tabData.id, "swapUnlocked"),
                (outer, inner) => [...outer, inner]
            ),
            share()
        );

        validationStateChanges.subscribeTracked(this, (data: [string, AppValidityState, boolean]) => {
            const [code, validation, unlocked] = data;

            this.isLoading = false;

            if (!validation.isValidCWL) {
                return;
            }

            const continuation: Promise<any> = (
                this.viewMode === "code"
                || !this.dataModel
                || this.revisionChangingInProgress
            ) ? this.resolveToModel(code) : Promise.resolve();

            continuation.then(() => {
                /**
                 * @name revisionHackFlagSwitchOff
                 * @see revisionChangingInProgress
                 * */
                this.revisionChangingInProgress = false;

                // copyOf property really matters only if we are working with the latest revision
                // otherwise, apps detached from copy state at some revision will still show locked state
                // and notification when switched to an older revision
                const props             = this.dataModel.customProps || {};
                const hasCopyOfProperty = props["sbg:copyOf"] && (~~props["sbg:revision"] === ~~props["sbg:latestRevision"]);
                const isNotWritable     = !this.tabData.isWritable;
                const isLocal           = this.tabData.dataSource === "local";

                if (isNotWritable || isLocal) {
                    this.isUnlockable = false;
                } else if (hasCopyOfProperty && !unlocked) {
                    const originalApp = this.dataModel.customProps["sbg:copyOf"];
                    this.notificationBar.showNotification(`This app is a read-only copy of ${originalApp}`, {type: "info"});
                    this.isUnlockable = true;
                }

                const isUnlockedAndUnlockableCopy = this.isUnlockable && hasCopyOfProperty && !unlocked;

                if (isNotWritable || isUnlockedAndUnlockableCopy) {
                    this.toggleLock(true);
                }

                if (isNotWritable && !this.isUnlockable) {
                    this.notificationBar.showNotification(`This app is locked for editing.`, {type: "info"});
                }
            }, err => console.warn);
        }, (err) => {
            console.warn("Error on validation state changes", err);
        });

        /** When the first validation ends, turn off the loader and determine which view we can show. Invalid app forces code view */
        firstValidationEnd.subscribe(state => {
            this.viewMode    = state.isValidCWL ? this.getPreferredTab() : "code";
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
    }

    setAppDirtyState(isModified: boolean) {

        if (AppHelper.isLocal(this.tabData.id)) {
            this.localRepository.patchAppMeta(this.tabData.id, "isDirty", isModified);
        } else {
            this.platformRepository.patchAppMeta(this.tabData.id, "isDirty", isModified);
        }
    }

    save(loadUpdate = true): Promise<boolean> {

        // Do nothing if app is not local
        // If we open an app that has no namespaces defined and save it right away,
        // cwlts will add an sbg namespace and will save it modified,
        // thus exporting something different than what was initially loaded.
        // That is not good, so we will just ignore saving if the app is not marked to be dirty
        // It would be nicer if the save method doesn't even get called, but then
        if (this.tabData.dataSource === "local" && !this.isDirty) {
            return;
        }

        const appName = this.tabData.id;

        const proc = this.statusBar.startProcess(`Saving ${appName}`);
        const text = this.viewMode === "code" ? this.codeEditorContent.value : this.getModelText();

        return this.appSavingService
            .save(this.tabData.id, text)
            .then(update => {
                /**
                 * FIXME: Reorganize how priority code updates should sync with the model, this is a quick fix
                 * without this, when publishing a new revision from the graph view, priority code update would sync model->code,
                 * but the code is actually up to date and the model isn't.

                 */

                if (loadUpdate) {
                    if (this.tabData.dataSource !== "local") {
                        this.revisionChangingInProgress = true;
                    }

                    this.priorityCodeUpdates.next(update);
                }

                // After app is saved, app state is not Dirty any more
                this.setAppDirtyState(false);

                this.statusBar.stopProcess(proc, `Saved: ${appName}`);
                return true;
            }, err => {
                if (!err || !err.message) {
                    this.statusBar.stopProcess(proc);
                    return false;
                }

                this.notificationBar.showNotification(`Saving failed: ${err.message}`);
                this.statusBar.stopProcess(proc, `Could not save ${appName} (${err.message})`);
                return false;
            });
    }

    publish(): void {

        if (!this.validationState.isValidCWL) {
            this.notificationBar.showNotification(`Cannot push this app because because it's doesn't match the proper JSON schema`);
            return;
        }

        const modal      = this.modal.fromComponent(PublishModalComponent, "Push an App");
        modal.appID      = this.dataModel.id;
        modal.appContent = this.getModelText(true);

        modal.published.pipe(
            take(1)
        ).subscribeTracked(this, appID => {

            const tab = this.workbox.getOrCreateAppTab({
                id: AppHelper.getRevisionlessID(appID),
                type: this.dataModel.class,
                label: modal.inputForm.get("id").value,
                isWritable: true,
                language: "json"
            });

            this.workbox.openTab(tab);
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
        return modal.response.pipe(
            take(1)
        ).toPromise().then(response => {
            this.toggleLock(false);
            return response;
        }, () => void 0);
    }

    /**
     * Tells whether GUI tabs are enabled
     */
    tabsUnlocked(): boolean {
        const codeCondition = this.validationState && this.validationState.isValidCWL && !this.isResolvingContent && !this.isValidatingCWL;
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

    appIsPublishable(): boolean {
        /** Bound to lock state by accident, not intention */
        return this.tabsUnlocked();
    }

    appIsRunnable() {
        return this.dataModel !== undefined;
    }

    openRevision(revisionNumber: number | string | any, revisionList: RevisionListComponent): Promise<any> {

        const fid = AppHelper.getAppIDWithRevision(this.tabData.id, revisionNumber);
        /** @name revisionHackFlagSwitchOn */
        this.revisionChangingInProgress = true;

        return this.dataGateway.fetchFileContent(fid).pipe(
            take(1)
        ).toPromise().then(result => {
            this.priorityCodeUpdates.next(result);

            this.setAppDirtyState(false);

            return result;
        }).catch(err => {
            this.revisionChangingInProgress = false;
            revisionList.loadingRevision    = false;
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

    scheduleExecution() {
        this.executionQueue.next(true);
    }

    /** Serializes model to a string. */
    protected getModelText(embed = false): string {
        return serializeModel(this.dataModel, embed, !(this.tabData.language === "json" || this.tabData.dataSource === "app"));
    }

    protected syncModelAndCode(resolveRDF = true): Promise<any> {

        if (this.viewMode === "code") {
            const codeVal = this.codeEditorContent.value;

            if (resolveRDF) {
                return this.resolveToModel(codeVal);
            }

            try {
                const json = Yaml.safeLoad(codeVal, {json: true} as LoadOptions);
                this.recreateModel(json);
                this.afterModelCreated(!this.modelCreated);
                this.modelCreated = true;

                return Promise.resolve();
            } catch (err) {
                return Promise.reject(err);
            }
        }

        if (!resolveRDF) {
            this.codeEditorContent.setValue(this.getModelText());
            return Promise.resolve();
        }

        const modelText = JSON.stringify(this.dataModel.serialize());

        return this.resolveContent(modelText).then((data: Object) => {
            const serialized = JSON.stringify(data, null, 4);
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

            this.notificationBar.showNotification(err.message || "An error has occurred");

            this.validationState.isValidCWL = false;
            this.validationState.errors     = [{
                loc: "document",
                type: "error",
                message: err.message
            }];

            this.viewMode = "code";
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

    protected resolveContent(content: string): Promise<Object> {
        this.isResolvingContent = true;
        return this.tabData.resolve(content).toPromise().then(resolved => {
            this.isResolvingContent = false;
            return resolved;
        }, err => {
            this.isResolvingContent = false;
            throw err;
        });
    }

    private bindExecutionQueue() {

        this.executionQueue.pipe(
            switchMap(() => this.runOnExecutor().pipe(
                finalize(() => this.isExecuting = false),
                catchError(err => {
                    console.error(err);
                    return empty();
                })
            ))
        ).subscribeTracked(this, () => void 0);

        this.executionQueue.pipe(
            flatMap(() => {
                const metaManager = this.injector.get(AppMetaManagerToken) as AppMetaManager;
                return metaManager.getAppMeta("job").pipe(
                    take(1)
                );
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

        const metaManager    = this.injector.get<AppMetaManager>(AppMetaManagerToken);
        const executorConfig = this.localRepository.getExecutorConfig();
        const job            = metaManager.getAppMeta("job");
        const user           = this.auth.getActive().pipe(
            map(user => user ? user.id : "local")
        );

        return combineLatest(job, executorConfig, user).pipe(
            take(1),
            switchMap(data => {

                const [job, executorConfig, user] = data;

                const appID        = this.tabData.id;
                const executorPath = executorConfig.choice === "bundled" ? undefined : executorConfig.path;
                const executor     = this.injector.get(ExecutorService2);
                const appIsLocal   = AppHelper.isLocal(appID);
                const outDir       = executor.makeOutputDirectoryName(executorConfig.outDir, appID, appIsLocal ? "local" : user);

                const jobWithAbspaths = appIsLocal ? ensureAbsolutePaths(path.dirname(appID), job) : job;

                return executor.execute(appID, this.dataModel, jobWithAbspaths, executorPath, {outDir}).pipe(
                    finalize(() => this.fileRepository.reloadPath(outDir))
                );
            })
        );

    }

    showModalIfAppIsDirty(): Promise<boolean> {

        return new Promise((changeRevision, preventRevisionChange) => {

            if (!this.isDirty) {
                return changeRevision();
            }

            const dialog = this.modal.fromComponent(ClosingDirtyAppsModalComponent, "Change revision", {
                confirmationLabel: "Save",
                discardLabel: "Change without saving",
                onCancel: () => preventRevisionChange(),
                onDiscard: () => changeRevision(),
                onConfirm: () => {
                    this.save(false).then(isSaved => {
                        isSaved ? changeRevision() : preventRevisionChange();
                    });
                }
            });

            dialog.inAnyCase = () => {
                this.modal.close(dialog);
            };
        });

    }

    importJob() {
        const metaManager = this.injector.get<AppMetaManager>(AppMetaManagerToken);
        const comp        = this.modal.fromComponent(JobImportExportComponent, "Import Job", {
            appID: this.tabData.id,
            action: "import",
            importTrasform: (job, path) => fixJobFilePaths(this.tabData.id, path, job)
        });

        comp.import.pipe(
            take(1)
        ).subscribeTracked(this, (jobObject) => {
            metaManager.patchAppMeta("job", jobObject);
            this.modal.close();
            if (this.jobEditor) {
                this.jobEditor.updateJob(jobObject);
            }
        });

    }

    exportJob() {
        const metaManager = this.injector.get<AppMetaManager>(AppMetaManagerToken);

        metaManager.getAppMeta("job").pipe(
            take(1)
        ).subscribeTracked(this, job => {
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
