import {AfterViewInit, Injector, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef} from "@angular/core";
import {FormControl} from "@angular/forms";
import {CommandLineToolModel, WorkflowModel} from "cwlts/models";

import * as Yaml from "js-yaml";
import {LoadOptions} from "js-yaml";
import "rxjs/add/observable/of";
import "rxjs/add/operator/do";
import "rxjs/add/operator/switchMap";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {AppExecutionContext} from "../../../../electron/src/storage/types/executor-config";
import {CodeSwapService} from "../../core/code-content-service/code-content.service";
import {DataGatewayService} from "../../core/data-gateway/data-gateway.service";
import {AppHelper} from "../../core/helpers/AppHelper";
import {ErrorWrapper} from "../../core/helpers/error-wrapper";
import {ProceedToEditingModalComponent} from "../../core/modals/proceed-to-editing-modal/proceed-to-editing-modal.component";
import {PublishModalComponent} from "../../core/modals/publish-modal/publish-modal.component";
import {AppTabData} from "../../core/workbox/app-tab-data";
import {WorkboxService} from "../../core/workbox/workbox.service";
import {ExecutorService} from "../../executor/executor.service";
import {NotificationBarService} from "../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {StatusControlProvider} from "../../layout/status-bar/status-control-provider.interface";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {ModalService} from "../../ui/modal/modal.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {AppExecutionContextModalComponent} from "../app-execution-context-modal/app-execution-context-modal.component";
import {AppValidatorService, AppValidityState} from "../app-validator/app-validator.service";
import {PlatformAppService} from "../components/platform-app-common/platform-app.service";
import {RevisionListComponent} from "../components/revision-list/revision-list.component";
import {EditorInspectorService} from "../inspector/editor-inspector.service";
import {APP_SAVER_TOKEN, AppSaver} from "../services/app-saving/app-saver.interface";
import {LocalRepositoryService} from "../../repository/local-repository.service";
import {ClosingDirtyAppsModalComponent} from "../../core/modals/closing-dirty-apps/closing-dirty-apps-modal.component";

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

    isReadonly = false;

    savingDisabled = true;

    isUnlockable = null;

    isExecuting = false;

    executionOutput = "";

    executionQueue = new Subject<any>();

    /** Template of the status controls that will be shown in the status bar */
    @ViewChild("statusControls")
    protected statusControls: TemplateRef<any>;

    @ViewChild("inspector", {read: ViewContainerRef})
    protected inspectorHostView: ViewContainerRef;

    protected appSavingService: AppSaver;

    private modelCreated = false;

    /**
     * Used to emit signals that should stop app execution, if it's running.
     * It is used a breaking emit, so anything can be pushed through it.
     */
    private executionStop = new Subject<any>();

    /**
     * Used as a hack flag so we can recreate the model on changes from non-gui mode,
     * or from any mode when switching revisions.
     * Please don't use it elsewhere unless discussing the added complexity of flag switching.
     *
     * {@link revisionHackFlagSwitchOff}
     * {@link revisionHackFlagSwitchOn}
     */
    private revisionChangingInProgress = false;

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
                protected workbox: WorkboxService,
                protected executor: ExecutorService) {

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

        /** Changes to the code that did not come from user's typing. */
        const externalCodeChanges = Observable.merge(this.tabData.fileContent, this.priorityCodeUpdates).distinctUntilChanged();

        /** Changes to the code from user's typing, slightly debounced */
        const codeEditorChanges = this.codeEditorContent.valueChanges.debounceTime(300).distinctUntilChanged();

        /** Observe all code changes */
        const allCodeChanges = Observable.merge(externalCodeChanges, codeEditorChanges).distinctUntilChanged();

        /** Attach a CWL validator to code updates and observe the validation state changes. */
        const schemaValidation = this.appValidator.createValidator(allCodeChanges).map((state: AppValidityState) => {
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


        // On user interactions (changes) set app state to Dirty
        validationStateChanges.skip(1).filter(() => this.revisionChangingInProgress === false)
            .subscribeTracked(this, () => {
                this.setAppDirtyState(true);
            }, (err) => {
                console.warn("Error on dirty checking stream", err);
            });


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

                    if (!this.tabData.isWritable || this.tabData.dataSource === "local") {
                        this.isUnlockable = false;
                    } else if (hasCopyOfProperty && !unlocked) {

                        const originalApp = this.dataModel.customProps["sbg:copyOf"];
                        this.notificationBar.showNotification(`This app is a copy of ${originalApp}`, {
                            type: "info"
                        });
                        this.isUnlockable = true;
                    }

                    const isUnlockedAndUnlockableCopy = this.isUnlockable && hasCopyOfProperty && !unlocked;

                    if (!this.tabData.isWritable || isUnlockedAndUnlockableCopy) {
                        this.toggleLock(true);
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

        this.bindExecutionQueue();
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
                /**
                 * FIXME: Reorganize how priority code updates should sync with the model, this is a quick fix
                 * without this, when publishing a new revision from the graph view, priority code update would sync model->code,
                 * but the code is actually up to date and the model isn't.

                 */

                if (this.tabData.dataSource !== "local") {
                    this.revisionChangingInProgress = true;
                }

                // After app is saved, app state is not Dirty any more
                this.setAppDirtyState(false);

                this.priorityCodeUpdates.next(update);


                this.statusBar.stopProcess(proc, `Saved: ${appName}`);
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

        this.syncModelAndCode(true).then(() => {
            const modal          = this.modal.fromComponent(PublishModalComponent, "Push an App");
            modal.appContent     = this.getModelText(true);
            const originalSubmit = modal.onSubmit;

            modal.onSubmit = (...args: any[]) => {
                return originalSubmit.apply(modal, args).then(appID => {

                    // After new revision is load, app state is not Dirty any more
                    this.setAppDirtyState(false);

                    const tab = this.workbox.getOrCreateAppTab({
                        id: AppHelper.getRevisionlessID(appID),
                        type: this.dataModel.class,
                        label: modal.inputForm.get("name").value,
                        isWritable: true,
                        language: "json"

                    });
                    this.workbox.openTab(tab);
                });
            };

        }, err => console.warn);
    }

    provideStatusControls(): TemplateRef<any> {
        return this.statusControls;
    }

    ngAfterViewInit() {
        this.inspector.setHostView(this.inspectorHostView);
        super.ngAfterViewInit();
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

    appIsResolvable(): boolean {
        /** Bound to lock state by accident, not intention */
        return this.tabsUnlocked();
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
    protected getModelText(embed?: boolean): string {

        const modelObject = this.dataModel.serialize();

        if (this.tabData.language === "json" || this.tabData.dataSource === "app") {
            return JSON.stringify(modelObject, null, 4);
        }

        return Yaml.dump(modelObject);
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
        }, err => console.warn);
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
            this.codeEditorContent.disable();

            return;
        }

        this.codeEditorContent.enable();

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
            this.isResolvingContent = false;
            return resolved;
        }, err => {
            this.isResolvingContent = false;
            throw err;
        });
    }

    private getExecutionContext(): Observable<AppExecutionContext | null> {

        const appID = this.tabData.id;

        return this.executor.getAppConfig(appID).take(1)
            .switchMap((context: AppExecutionContext) => {

                // If we have job path set, we can proceed with execution
                if (context.jobPath) {
                    return Observable.of(context);
                }

                // Otherwise, we have to obtain job path
                const modal = this.modal.fromComponent(AppExecutionContextModalComponent, "Set Execution Parameters");

                modal.confirmLabel = "Run";
                modal.context = context;
                modal.appID   = appID;

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

        // When a new execution is in the line, run it
        this.executionQueue
            .switchMap(() => {                               // Switch so the execution gets cancelled when new one is scheduled
                return this.runOnExecutor()                  // Starts the execution process
                    .takeUntil(this.executionStop.do(() => this.executionOutput += "Execution Stopped"))
                    .finally(() => {
                        // When it ends, turn off the UI flag
                        this.isExecuting = false;
                    })
                    .catch(err => {
                        // We need to catch the error here, because if we catch it in the end, queue sub will be disposed
                        const wrappedError = new ErrorWrapper(err).toString();
                        this.executionOutput += `<div class="text-error">${wrappedError}</div>`;
                        return Observable.empty();
                    });
            })
            .subscribeTracked(this, (output: string | Object) => {

                // Output result comes as a JSON object with info about execution results
                // Otherwise, it's a string, most likely an [INFO] log from stderr, which we should print out
                let localOutput = "";
                if (typeof output === "object") {
                    localOutput = JSON.stringify(output, null, 4);
                } else if (typeof output === "string") {
                    localOutput = output;
                } else {
                    return;
                }

                // Replace newlines with html tags because we are colouring lines separately
                localOutput = localOutput.replace(/\n/g, "<br/>");

                /**
                 * Relies on custom-added prefix to wrap up error messages
                 * @name AppEditorBase.__errorDiscriminator
                 * @see RabixExecutor.__errorPrefixing
                 */
                if (localOutput.startsWith("ERR: ")) {
                    this.executionOutput += `<div class="text-error">${localOutput.slice(5)}</div>`;
                } else {
                    this.executionOutput += `<div>${localOutput}</div>`;
                }
            });

        // Whenever a new app queues for execution, toggle the “isExecuting” GUI flag
        this.executionQueue.subscribeTracked(this, () => {
            this.executionOutput = "";
            this.toggleReport("execution", true);

            this.isExecuting = true;
        });
    }

    stopExecution() {
        this.executionStop.next(1);
    }

    private runOnExecutor(): Observable<string | Object> {

        return new Observable(obs => {

            const modelObject = this.dataModel.serialize();
            delete modelObject["sbg:job"]; // Bunny traverses mistakenly into this to look for actual inputs
            const modelText = Yaml.dump(modelObject, {});

            const runner = this.getExecutionContext().switchMap(context => {
                return this.executor
                    .run(this.tabData.id, modelText, context.jobPath, context.executionParams)
                    .finally(() => {
                        obs.complete();
                    });
            }).subscribe(obs);

            return () => {
                runner.unsubscribe();
            };

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
            modal.discardLabel = "Change without saving";

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
}
