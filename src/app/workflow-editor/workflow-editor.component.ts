import {AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {WorkflowFactory, WorkflowModel} from "cwlts/models";
import * as Yaml from "js-yaml";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/merge";
import "rxjs/add/operator/switchMap";
import {CodeSwapService} from "../core/code-content-service/code-content.service";
import {DataGatewayService} from "../core/data-gateway/data-gateway.service";
import {AppEditorBase} from "../editor-common/app-editor-base/app-editor-base";
import {AppValidatorService} from "../editor-common/app-validator/app-validator.service";
import {PlatformAppService} from "../editor-common/components/platform-app-common/platform-app.service";
import {EditorInspectorService} from "../editor-common/inspector/editor-inspector.service";
import {APP_SAVER_TOKEN} from "../editor-common/services/app-saving/app-saver.interface";
import {LocalFileSavingService} from "../editor-common/services/app-saving/local-file-saving.service";
import {PlatformAppSavingService} from "../editor-common/services/app-saving/platform-app-saving.service";
import {NotificationBarService} from "../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../repository/platform-repository.service";
import {IpcService} from "../services/ipc.service";
import {ModalService} from "../ui/modal/modal.service";
import {WorkflowGraphEditorComponent} from "./graph-editor/graph-editor/workflow-graph-editor.component";
import {WorkflowEditorService} from "./workflow-editor.service";

@Component({
    selector: "ct-workflow-editor",
    providers: [EditorInspectorService, NotificationBarService, WorkflowEditorService, CodeSwapService, PlatformAppService,
        {
            provide: APP_SAVER_TOKEN,
            useFactory(comp: WorkflowEditorComponent, ipc: IpcService, modal: ModalService, platformRepository: PlatformRepositoryService) {

                if (comp.tabData.dataSource === "local") {
                    return new LocalFileSavingService(ipc);
                }

                return new PlatformAppSavingService(platformRepository, modal);
            },
            deps: [WorkflowEditorComponent, IpcService, ModalService, PlatformRepositoryService]
        }
    ],
    styleUrls: ["../editor-common/app-editor-base/app-editor-base.scss"],
    templateUrl: "./workflow-editor.component.html"
})
export class WorkflowEditorComponent extends AppEditorBase implements OnDestroy, OnInit, AfterViewInit {


    constructor(statusBar: StatusBarService,
                errorBar: NotificationBarService,
                modal: ModalService,
                inspector: EditorInspectorService,
                dataGateway: DataGatewayService,
                injector: Injector,
                appValidator: AppValidatorService,
                codeSwapService: CodeSwapService,
                private platformRepository: PlatformRepositoryService,
                private cdr: ChangeDetectorRef,
                platformAppService: PlatformAppService) {
        super(statusBar, errorBar, modal, inspector, dataGateway, injector, appValidator, codeSwapService, platformAppService);
    }

    protected getPreferredTab(): string {
        return "graph";
    }

    protected recreateModel(json: Object): void {
        this.dataModel = WorkflowFactory.from(json as any, "document");
        console.log("Data model is now", this.dataModel);
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

        this.platformRepository.getUpdates(nestedAppRevisionlessIDs).then(result => {

            const appRevisionMap = result.reduce((acc, item) => {

                const revisionlessID = item.id.split("/").slice(0, 3).join("/");
                return {...acc, [revisionlessID]: item.revision};
            }, {});

            this.dataModel.steps.forEach(step => {

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

            this.statusBar.stopProcess(updateStatusProcess);
        }).catch(err => {
            this.errorBar.showError("Cannot get app updates. " + (err.error ? err.error.message : err.message));
            this.statusBar.stopProcess(updateStatusProcess);
        });


        // Observable.of(1).switchMap(() => {
        //     // Call service only if wf is in user projects
        //     if (this.tabData.dataSource !== "local" && this.tabData.isWritable) {
        //
        //         const [appHash] = this.tabData.id.split("/");
        //         const api       = this.apiGateway.forHash(appHash);
        //
        //         return api.getUpdates(this.workflowModel.steps
        //             .map(step => step.run ? step.run.customProps["sbg:id"] : null)
        //             .filter(s => !!s));
        //
        //         // return this.platform.getUpdates(this.workflowModel.steps
        //         //     .map(step => step.run ? step.run.customProps["sbg:id"] : null)
        //         //     .filter(s => !!s))
        //     }
        //
        //     return Observable.of(undefined);
        // }).subscribe((response) => {
        //
        //     if (response) {
        //         Object.keys(response).forEach(key => {
        //             if (response[key] === true) {
        //                 this.workflowModel.steps
        //                     .filter(step => step.run.customProps["sbg:id"] === key)
        //                     .forEach(step => step.hasUpdate = true);
        //             }
        //         });
        //     }
        //
        //     // load document in GUI and turn off loader, only if loader was active
        //     if (this.isLoading) {
        //         this.isLoading = false;
        //     }
        //
        // });
    }

    /**
     * Serializes model to text. It also adds sbg:modified flag to indicate
     * the text has been formatted by the GUI editor
     */
    protected getModelText(embed = false): string {
        const wf          = embed ? this.dataModel.serializeEmbedded() : this.dataModel.serialize();
        const modelObject = Object.assign(wf, {"sbg:modified": true});

        return this.tabData.language === "json" || this.tabData.dataSource === "app" ?
            JSON.stringify(modelObject, null, 4) : Yaml.dump(modelObject);
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
