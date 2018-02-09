import {AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {WorkflowFactory, WorkflowModel} from "cwlts/models";
import * as Yaml from "js-yaml";
import {APP_META_MANAGER, appMetaManagerFactory} from "../core/app-meta/app-meta-manager-factory";
import {CodeSwapService} from "../core/code-content-service/code-content.service";
import {DataGatewayService} from "../core/data-gateway/data-gateway.service";
import {AppHelper} from "../core/helpers/AppHelper";
import {APP_MODEL, appModelFactory} from "../core/factories/app-model-provider-factory";
import {WorkboxService} from "../core/workbox/workbox.service";
import {AppEditorBase} from "../editor-common/app-editor-base/app-editor-base";
import {AppValidatorService} from "../editor-common/app-validator/app-validator.service";
import {PlatformAppService} from "../editor-common/components/platform-app-common/platform-app.service";
import {EditorInspectorService} from "../editor-common/inspector/editor-inspector.service";
import {APP_SAVER_TOKEN} from "../editor-common/services/app-saving/app-saver.interface";
import {LocalFileSavingService} from "../editor-common/services/app-saving/local-file-saving.service";
import {PlatformAppSavingService} from "../editor-common/services/app-saving/platform-app-saving.service";
import {ExecutorService} from "../executor-service/executor.service";
import {NotificationBarService} from "../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../layout/status-bar/status-bar.service";
import {LocalRepositoryService} from "../repository/local-repository.service";
import {PlatformRepositoryService} from "../repository/platform-repository.service";
import {IpcService} from "../services/ipc.service";
import {ModalService} from "../ui/modal/modal.service";
import {WorkflowGraphEditorComponent} from "./graph-editor/graph-editor/workflow-graph-editor.component";
import {WorkflowEditorService} from "./workflow-editor.service";
import {AppUpdateService} from "../editor-common/services/app-update/app-updating.service";
import {FileRepositoryService} from "../file-repository/file-repository.service";
import {ExportAppService} from "../services/export-app/export-app.service";
import {HintsModalComponent} from "../core/modals/hints-modal/hints-modal.component";
import {Store} from "@ngrx/store";
import {AuthCredentials} from "../auth/model/auth-credentials";
import {AuthService} from "../auth/auth.service";

export function appSaverFactory(comp: WorkflowEditorComponent, ipc: IpcService, modal: ModalService, platformRepository: PlatformRepositoryService) {

    if (comp.tabData.dataSource === "local") {
        return new LocalFileSavingService(ipc);
    }

    return new PlatformAppSavingService(platformRepository, modal);
}

@Component({
    selector: "ct-workflow-editor",
    providers: [EditorInspectorService, NotificationBarService, WorkflowEditorService, CodeSwapService, PlatformAppService,
        {
            provide: APP_SAVER_TOKEN,
            useFactory: appSaverFactory,
            deps: [WorkflowEditorComponent, IpcService, ModalService, PlatformRepositoryService]
        }, {
            provide: APP_META_MANAGER,
            useFactory: appMetaManagerFactory,
            deps: [WorkflowEditorComponent, LocalRepositoryService, PlatformRepositoryService]
        },
        {
            provide: APP_MODEL,
            useFactory: appModelFactory,
            deps: [WorkflowEditorComponent]
        }

    ],
    styleUrls: ["../editor-common/app-editor-base/app-editor-base.scss"],
    templateUrl: "./workflow-editor.component.html"
})
export class WorkflowEditorComponent extends AppEditorBase implements OnDestroy, OnInit, AfterViewInit {

    inspectorService: EditorInspectorService;

    constructor(statusBar: StatusBarService,
                notificationBar: NotificationBarService,
                modal: ModalService,
                inspector: EditorInspectorService,
                dataGateway: DataGatewayService,
                injector: Injector,
                appValidator: AppValidatorService,
                codeSwapService: CodeSwapService,
                protected platformRepository: PlatformRepositoryService,
                protected cdr: ChangeDetectorRef,
                platformAppService: PlatformAppService,
                localRepository: LocalRepositoryService,
                fileRepository: FileRepositoryService,
                workbox: WorkboxService,
                updateService: AppUpdateService,
                exportApp: ExportAppService,
                store: Store<any>,
                auth: AuthService,
                executorService: ExecutorService) {
        super(
            statusBar,
            notificationBar,
            modal,
            inspector,
            dataGateway,
            injector,
            appValidator,
            codeSwapService,
            platformAppService,
            platformRepository,
            localRepository,
            fileRepository,
            workbox,
            exportApp,
            store,
            auth,
            executorService,
            updateService,
            exportApp
        );

        this.inspectorService = inspector;

        this.updateService.update
            .filter((data: {id: string, app: any}) => {

                /**
                 *  Perform filter to see if updated app is a part of this workflow - all local workflows
                 *  and platform workflows that have the 'sbg:id" property should be updated if necessary
                 */
                let filterFn = (step) => false;
                if (this.tabData.dataSource === "local") {
                    filterFn = (step) => step.customProps["sbg:rdfId"] === data.id || step.runPath === data.id;
                } else if (data.id && !AppHelper.isLocal(data.id)) {
                    filterFn = (step) => AppHelper.getRevisionlessID(step.run.customProps["sbg:id"] || "") === AppHelper.getRevisionlessID(data.id);
                }
                return this.dataModel && this.dataModel.steps.filter(filterFn).length > 0;
            })
            .subscribeTracked(this, (data: {id: string, app: any}) => {

                if (this.tabData.dataSource === "local") {
                    let steps;
                    const invalidStepIndex = this.invalidSteps.indexOf(data.id);
                    if (data.app) {

                        // If step-to-be-updated is a valid app, remove it from the list of invalid steps (if included)
                        if (~invalidStepIndex) {
                            this.invalidSteps.splice(invalidStepIndex, 1);
                        }

                        steps = this.dataModel.steps.filter(step => step.customProps["sbg:rdfId"] === data.id);
                        steps.forEach(step => step.setRunProcess(data.app));

                        // If an updated node was open in inspector, reopen inspector with updated node information
                        if (this.graphEditor && this.showInspector && steps && this.graphEditor.inspectedNode) {
                            const inspectedStep = steps.filter((step) => step.connectionId === this.graphEditor.inspectedNode.connectionId)[0];
                            if (inspectedStep) {
                                this.graphEditor.openNodeInInspectorById(this.graphEditor.inspectedNode.id, true);
                            }
                        }

                        this.resolveAfterModelAndCodeSync().then(() => {}, err => console.warn);
                    } else {

                        // Add step to list of invalid steps (if not already included)
                        if (!~invalidStepIndex) {
                            this.invalidSteps.push(data.id);
                            this.resolveContent(this.getModelText()).then(() => {}, err => console.warn);
                        }
                    }
                } else {
                    if (this.graphEditor) {
                        this.graphEditor.getStepUpdates();
                    } else {
                        this.graphDrawQueue.push(() => this.graphEditor.getStepUpdates());
                    }
                }
            });
    }

    protected getPreferredTab(): string {
        return "graph";
    }

    protected recreateModel(json: Object): void {
        this.dataModel = WorkflowFactory.from(json as any, "document");
        this.dataModel.setValidationCallback(this.afterModelValidation.bind(this));
        this.dataModel.validate().then(this.afterModelValidation.bind(this));
    }


    /** Default view mode. */
    viewMode: "info" | "graph" | "code" | "test" | string;

    /** Model that's recreated on document change */
    dataModel: WorkflowModel;

    /**
     * Used to keep track of invalid steps (in local workflows only). App validation will not show errors
     * for (not embedded) invalid steps, so we need this list to know whether or not to call resolve after validation.
     * Steps can become invalid if the app behind the step is saved while invalid.
     */
    invalidSteps = [];

    @ViewChild(WorkflowGraphEditorComponent)
    graphEditor: WorkflowGraphEditorComponent;

    private hasPendingRedraw = false;

    private graphDrawQueue: Function[] = [];

    protected toggleLock(locked: boolean): void {
        super.toggleLock(locked);

        if (this.graphEditor) {
            this.graphEditor.setGraphManipulationsLock(locked);
        } else {
            this.graphDrawQueue.push(() => {
                this.graphEditor.setGraphManipulationsLock(locked);
            });
        }
    }

    /**
     * Serializes model to text. It also adds sbg:modified flag to indicate
     * the text has been formatted by the GUI editor
     */
    protected getModelText(forceJSON = false, embed = false): string {
        const wf = embed || this.tabData.dataSource === "app" ? this.dataModel.serializeEmbedded() : this.dataModel.serialize();

        return this.tabData.language === "json" || this.tabData.dataSource === "app" || forceJSON ?
            JSON.stringify(wf, null, 4) : Yaml.dump(wf);
    }

    onTabActivation(): void {
        if (this.graphEditor) {
            this.graphEditor.checkOutstandingGraphFitting();

            if (this.hasPendingRedraw) {
                this.hasPendingRedraw = !this.graphEditor.redrawIfCanDrawInWorkflow();
            }
        }
    }

    onGraphDraw(component: WorkflowGraphEditorComponent) {
        this.graphEditor = component;

        while (this.graphDrawQueue.length) {
            this.graphDrawQueue.shift()();
        }
    }

    setHints() {
        const hints = this.modal.fromComponent(HintsModalComponent, {
            title: "Set Hints",
            backdrop: true,
            closeOnEscape: true
        });

        hints.model = this.dataModel;
        hints.readonly = this.isReadonly;
    }
}
