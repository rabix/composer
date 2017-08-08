import {AfterViewInit, Injector, Input, OnInit, TemplateRef, ViewChild, ViewContainerRef} from "@angular/core";
import {FormControl} from "@angular/forms";
import {CommandLineToolModel, WorkflowModel} from "cwlts/models";

import * as Yaml from "js-yaml";
import {LoadOptions} from "js-yaml";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {CodeSwapService} from "../../core/code-content-service/code-content.service";
import {DataGatewayService} from "../../core/data-gateway/data-gateway.service";
import {ErrorWrapper} from "../../core/helpers/error-wrapper";
import {ProceedToEditingModalComponent} from "../../core/modals/proceed-to-editing-modal/proceed-to-editing-modal.component";
import {PublishModalComponent} from "../../core/modals/publish-modal/publish-modal.component";
import {AppTabData} from "../../core/workbox/app-tab-data";
import {ErrorNotification, InfoNotification, NotificationBarService} from "../../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../../layout/status-bar/status-bar.service";
import {StatusControlProvider} from "../../layout/status-bar/status-control-provider.interface";
import {PlatformRepositoryService} from "../../repository/platform-repository.service";
import {ModalService} from "../../ui/modal/modal.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {AppValidatorService, AppValidityState} from "../app-validator/app-validator.service";
import {PlatformAppService} from "../components/platform-app-common/platform-app.service";
import {RevisionListComponent} from "../components/revision-list/revision-list.component";
import {EditorInspectorService} from "../inspector/editor-inspector.service";
import {APP_SAVER_TOKEN, AppSaver} from "../services/app-saving/app-saver.interface";

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

    /** Template of the status controls that will be shown in the status bar */
    @ViewChild("statusControls")
    protected statusControls: TemplateRef<any>;

    @ViewChild("inspector", {read: ViewContainerRef})
    protected inspectorHostView: ViewContainerRef;

    protected changeTabLabel: (title: string) => void;
    protected originalTabLabel: string;
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
    private revisionChangingInProgress = false;

    constructor(protected statusBar: StatusBarService,
                protected notificationBar: NotificationBarService,
                protected modal: ModalService,
                protected inspector: EditorInspectorService,
                protected dataGateway: DataGatewayService,
                protected injector: Injector,
                protected appValidator: AppValidatorService,
                protected codeSwapService: CodeSwapService,
                protected platformAppService: PlatformAppService,
                protected platformRepository: PlatformRepositoryService) {

        super();
    }

    registerOnTabLabelChange(update: (label: string) => void, originalLabel: string): void {
        this.changeTabLabel   = update;
        this.originalTabLabel = originalLabel;
    }

    ngOnInit() {

        this.inspector.inspectedObject
            .map(obj => obj !== undefined)
            .subscribeTracked(this, show => this.showInspector = show);

        // Push status controls to the status bar
        this.statusBar.setControls(this.statusControls);

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
        firstValidationEnd.withLatestFrom(externalCodeChanges)
            .switchMap((data: [AppValidityState, string]) => {
                const [validationState, code] = data;
                return validationCompletion
                    .startWith(validationState)
                    .map(state => [this.codeEditorContent.value, state]);
            })
            .withLatestFrom(
                this.platformRepository.getAppMeta(this.tabData.id, "swapUnlocked"),
                (outer, inner) => [...outer, inner])
            .subscribeTracked(this, (data: [string, AppValidityState, boolean]) => {
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
                        this.notificationBar.showNotification(
                            new InfoNotification("This app is a copy of " + this.dataModel.customProps["sbg:copyOf"])
                        );
                        this.isUnlockable = true;
                    }

                    if (!this.tabData.isWritable || (this.isUnlockable && hasCopyOfProperty && !unlocked)) {
                        this.toggleLock(true);
                    }
                }, err => console.warn);
            });


        /** When types something in the code editor for the first time, add a star to the tab label */
        /** This does not work very well, so disable it for now */
        // firstDirtyCodeChange.subscribeTracked(this, isDirty => this.changeTabLabel(this.originalTabLabel + (isDirty ? " (modified)" : "")));


        /** When the first validation ends, turn off the loader and determine which view we can show. Invalid app forces code view */
        firstValidationEnd.subscribe(state => {
            this.viewMode    = state.isValidCWL ? this.getPreferredTab() : "code";
            this.reportPanel = state.isValidCWL ? this.getPreferredReportPanel() : this.reportPanel;
        });
    }

    save(): void {

        const proc = this.statusBar.startProcess(`Saving ${this.originalTabLabel}`);
        const text = this.viewMode === "code" ? this.codeEditorContent.value : this.getModelText();

        this.appSavingService
            .save(this.tabData.id, text)
            .then(update => {
                this.priorityCodeUpdates.next(update);
                this.statusBar.stopProcess(proc, `Saved: ${this.originalTabLabel}`);
            }, err => {
                if (!err || !err.message) {
                    this.statusBar.stopProcess(proc);
                    return;
                }

                this.notificationBar.showNotification(new ErrorNotification(`Saving failed: ${err.message}`));
                this.statusBar.stopProcess(proc, `Could not save ${this.originalTabLabel} (${err.message})`);
            });
    }

    publish(): void {

        if (!this.validationState.isValidCWL) {
            this.notificationBar.showNotification(new ErrorNotification(`Cannot publish this app because because it's doesn't match the proper JSON schema`));
            return;
        }

        this.syncModelAndCode(true).then(() => {
            const modal      = this.modal.fromComponent(PublishModalComponent, {title: "Publish an App"});
            modal.appContent = this.getModelText(true);
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
        });
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
        return this.tabsUnlocked();
    }

    appIsResolvable(): boolean {
        /** Bound to lock state by accident, not intention */
        return this.tabsUnlocked();
    }

    appIsPublishable(): boolean {
        /** Bound to lock state by accident, not intention */
        return this.tabsUnlocked();
    }

    openRevision(revisionNumber: number | string): Promise<any> {

        const fid = this.tabData.id.split("/").slice(0, 3).concat(revisionNumber.toString()).join("/");

        /** @name revisionHackFlagSwitchOn */
        this.revisionChangingInProgress = true;

        return this.dataGateway.fetchFileContent(fid).take(1)
            .toPromise().then(result => {
                this.priorityCodeUpdates.next(result);
                return result;
            }).catch(err => {
                this.revisionChangingInProgress   = false;
                this.revisionList.loadingRevision = false;
                this.notificationBar.showNotification(
                    new ErrorNotification("Cannot open revision. " + new ErrorWrapper(err))
                );
            });
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
        });
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

        return new Promise((resolve, reject) => {
            if (appMightBeRDF) {
                const statusMessage = this.statusBar.startProcess("Resolving RDF Schema...");

                this.resolveContent(content).then(resolved => {
                    this.recreateModel(resolved);
                    this.afterModelCreated(!this.modelCreated);
                    this.modelCreated = true;

                    this.statusBar.stopProcess(statusMessage, "");
                    resolve(resolved);
                }, err => {
                    this.statusBar.stopProcess(statusMessage, "Failed to resolve RDF schema.");
                    reject(err);
                });

                return;
            }

            const json = Yaml.safeLoad(content, {json: true} as LoadOptions);
            this.recreateModel(json);
            this.afterModelCreated(!this.modelCreated);
            this.modelCreated = true;
            resolve(json);

        }).then(result => {
            return result;
        }, err => {
            this.notificationBar.showNotification(new ErrorNotification("RDF resolution error: " + err.message));

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

    switchTab(tabName): void {

        if (!tabName) {
            return;
        }

        /** If switching to code mode, serialize the model first and update the editor text */
        if (this.viewMode !== "code" && tabName === "code") {
            this.priorityCodeUpdates.next(this.getModelText());
            this.viewMode = tabName;
            return;
        }

        /** If going from code mode to gui, resolve the content first */
        if ((this.viewMode === "code" || !this.viewMode) && tabName !== "code") {

            // Trick that will change reference for tabselector highlight line (to reset it to a Code mode if resolve fails)
            this.viewMode = undefined;
            this.resolveToModel(this.codeEditorContent.value).then(() => {
                this.viewMode = tabName;
            }, err => {
                this.viewMode = "code";
            });
            return;
        }

        // If changing from|to mode that is not a Code mode, just switch
        this.viewMode = tabName;
    }

    /**
     * When click on Resolve button (visible only if app is a local file and you are in Code mode)
     */
    resolveButtonClick(): void {
        this.resolveToModel(this.codeEditorContent.value).then(() => {
        }, err => console.warn);
    }

    toggleReport(panel: string) {
        this.reportPanel = this.reportPanel === panel ? undefined : panel;

        // Force browser reflow, heights and scroll bar size gets inconsistent otherwise
        setTimeout(() => window.dispatchEvent(new Event("resize")));
    }

    openOnPlatform(appID: string) {
        this.platformAppService.openOnPlatform(appID);
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
}
