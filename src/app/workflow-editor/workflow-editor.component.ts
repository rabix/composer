import {AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {WorkflowFactory, WorkflowModel} from "cwlts/models";
import * as Yaml from "js-yaml";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/switchMap";
import {Observable} from "rxjs/Observable";
import {CodeSwapService} from "../core/code-content-service/code-content.service";
import {DataGatewayService} from "../core/data-gateway/data-gateway.service";
import {AppEditorBase} from "../editor-common/app-editor-base/app-editor-base";
import {AppValidatorService} from "../editor-common/app-validator/app-validator.service";
import {PlatformAppService} from "../editor-common/components/platform-app-common/platform-app.service";
import {EditorInspectorService} from "../editor-common/inspector/editor-inspector.service";
import {APP_SAVER_TOKEN} from "../editor-common/services/app-saving/app-saver.interface";
import {LocalFileSavingService} from "../editor-common/services/app-saving/local-file-saving.service";
import {PlatformAppSavingService} from "../editor-common/services/app-saving/platform-app-saving.service";
import {
    ErrorNotification,
    NotificationBarService
} from "../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../repository/platform-repository.service";
import {IpcService} from "../services/ipc.service";
import {ModalService} from "../ui/modal/modal.service";
import {WorkflowGraphEditorComponent} from "./graph-editor/graph-editor/workflow-graph-editor.component";
import {WorkflowEditorService} from "./workflow-editor.service";

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
        }
    ],
    styleUrls: ["../editor-common/app-editor-base/app-editor-base.scss"],
    templateUrl: "./workflow-editor.component.html"
})
export class WorkflowEditorComponent extends AppEditorBase implements OnDestroy, OnInit, AfterViewInit {


    constructor(statusBar: StatusBarService,
                notificationBar: NotificationBarService,
                modal: ModalService,
                inspector: EditorInspectorService,
                dataGateway: DataGatewayService,
                injector: Injector,
                appValidator: AppValidatorService,
                codeSwapService: CodeSwapService,
                protected platformRepository: PlatformRepositoryService,
                private cdr: ChangeDetectorRef,
                platformAppService: PlatformAppService,) {
        super(statusBar, notificationBar, modal, inspector, dataGateway, injector, appValidator, codeSwapService, platformAppService, platformRepository);
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
    viewMode: "info" | "graph" | "code" | string;

    /** Model that's recreated on document change */
    dataModel: WorkflowModel;

    @ViewChild(WorkflowGraphEditorComponent)
    graphEditor: WorkflowGraphEditorComponent;

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


    protected afterModelCreated(isFirstCreation: boolean): void {
        if (this.tabData.isWritable && this.tabData.dataSource !== "local") {
            this.getStepUpdates();
        }
    }

    /**
     * Call updates service to get information about steps if they have updates and mark ones that can be updated
     */
    private getStepUpdates() {


        const updateStatusProcess      = this.statusBar.startProcess("Checking for app updates…");
        const nestedAppRevisionlessIDs = this.dataModel.steps
            .map(step => {
                if (!step.run || !step.run.customProps || !step.run.customProps["sbg:id"]) {
                    return;
                }

                return step.run.customProps["sbg:id"].split("/").slice(0, 3).join("/");
            })
            .filter(v => v);

        // We are wrapping a promise as a tracked observable so we easily dispose of it when component gets destroyed
        // If this gets destroyed while fetch is in progress, when it completes it will try to access the destroyed view
        // which results in throwing an exception
        Observable.fromPromise(this.platformRepository.getUpdates(nestedAppRevisionlessIDs))
            .finally(() => this.statusBar.stopProcess(updateStatusProcess))
            .subscribeTracked(this, result => {

                const appRevisionMap = result.reduce((acc, item) => {

                    const revisionlessID = item.id.split("/").slice(0, 3).join("/");
                    return {...acc, [revisionlessID]: item.revision};
                }, {});

            this.dataModel.steps.forEach(step => {

                // a non-sbg app might be embedded in an sbg workflow
                if (!step.run.customProps || !step.run.customProps["sbg:id"]) {
                    return;
                }
                    const revisionless = step.run.customProps["sbg:id"].split("/").slice(0, 3).join("/");
                    const revision     = Number(step.run.customProps["sbg:id"].split("/").pop());

                    if (appRevisionMap[revisionless] === undefined) {
                        return;
                    }

                    step.hasUpdate = appRevisionMap[revisionless] > revision;
                });

                setTimeout(() => {
                    this.cdr.markForCheck();
                    this.cdr.detectChanges();
                });
            }, err => {
                this.notificationBar.showNotification(new ErrorNotification("Cannot get app updates. " + (err.error ? err.error.message : err.message)));
            });
    }

    /**
     * Serializes model to text. It also adds sbg:modified flag to indicate
     * the text has been formatted by the GUI editor
     */
    protected getModelText(embed = false): string {
        const wf = embed || this.tabData.dataSource === "app" ? this.dataModel.serializeEmbedded() : this.dataModel.serialize();

        return this.tabData.language === "json" || this.tabData.dataSource === "app" ?
            JSON.stringify(wf, null, 4) : Yaml.dump(wf);
    }

    onTabActivation(): void {
        if (this.graphEditor) {
            this.graphEditor.checkOutstandingGraphFitting();
        }
    }

    onGraphDraw(component: WorkflowGraphEditorComponent) {
        this.graphEditor = component;

        while (this.graphDrawQueue.length) {
            this.graphDrawQueue.shift()();
        }
    }
}
