import {Component, EventEmitter, Injector, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {CommandLineToolModel, isType, WorkflowFactory, WorkflowModel, WorkflowStepInputModel, WorkflowStepOutputModel} from "cwlts/models";
import {CommandLineToolFactory} from "cwlts/models/generic/CommandLineToolFactory";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import {JobHelper} from "cwlts/models/helpers/JobHelper";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
import {AppMetaManager} from "../core/app-meta/app-meta-manager";
import {APP_META_MANAGER, appMetaManagerFactory} from "../core/app-meta/app-meta-manager-factory";
import {CodeSwapService} from "../core/code-content-service/code-content.service";
import {DataGatewayService} from "../core/data-gateway/data-gateway.service";
import {APP_MODEL, appModelFactory} from "../core/factories/app-model-provider-factory";
import {WorkboxService} from "../core/workbox/workbox.service";
import {AppEditorBase} from "../editor-common/app-editor-base/app-editor-base";
import {AppValidatorService} from "../editor-common/app-validator/app-validator.service";
import {PlatformAppService} from "../editor-common/components/platform-app-common/platform-app.service";
import {GraphJobEditorComponent} from "../job-editor/graph-job-editor/graph-job-editor.component";
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
import {FileRepositoryService} from "../file-repository/file-repository.service";
import {Subscription} from "rxjs/Subscription";
import {ExportAppService} from "../services/export-app/export-app.service";
import {Store} from "@ngrx/store";
import {AuthService} from "../auth/auth.service";

export function appSaverFactory(comp: ToolEditorComponent, ipc: IpcService, modal: ModalService, platformRepository: PlatformRepositoryService) {

    if (comp.tabData.dataSource === "local") {
        return new LocalFileSavingService(ipc);
    }

    return new PlatformAppSavingService(platformRepository, modal);
}

@Component({
    selector: "ct-tool-editor",
    styleUrls: ["../editor-common/app-editor-base/app-editor-base.scss"],
    providers: [
        EditorInspectorService,
        NotificationBarService,
        CodeSwapService,
        PlatformAppService,
        {
            provide: APP_SAVER_TOKEN,
            useFactory: appSaverFactory,
            deps: [ToolEditorComponent, IpcService, ModalService, PlatformRepositoryService]
        }, {
            provide: APP_META_MANAGER,
            useFactory: appMetaManagerFactory,
            deps: [ToolEditorComponent, LocalRepositoryService, PlatformRepositoryService]
        },
        {
            provide: APP_MODEL,
            useFactory: appModelFactory,
            deps: [ToolEditorComponent]
        }
    ],
    templateUrl: "./tool-editor.component.html"
})
export class ToolEditorComponent extends AppEditorBase implements OnInit {

    /** Default view mode. */
    viewMode: "code" | "gui" | "test" | "info";

    /** Flag for bottom panel, shows validation-issues, commandline, or neither */
    reportPanel: "validation" | "commandLinePreview" | undefined;

    /** Model that's recreated on document change */
    dataModel: CommandLineToolModel;

    workflowWrapper: WorkflowModel;

    /** Sorted array of resulting command line parts */
    commandLineParts: Subject<CommandLinePart[]> = new ReplaySubject(1);

    toolGroup: FormGroup;

    dirty = new EventEmitter();

    jobSubscription: Subscription;


    constructor(statusBar: StatusBarService,
                notificationBarService: NotificationBarService,
                modal: ModalService,
                inspector: EditorInspectorService,
                dataGateway: DataGatewayService,
                injector: Injector,
                appValidator: AppValidatorService,
                codeSwapService: CodeSwapService,
                platformRepository: PlatformRepositoryService,
                platformAppService: PlatformAppService,
                localRepository: LocalRepositoryService,
                fileRepository: FileRepositoryService,
                workbox: WorkboxService,
                exportApp: ExportAppService,
                store: Store<any>,
                auth: AuthService,
                executor: ExecutorService) {

        super(
            statusBar,
            notificationBarService,
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
            executor,
        );
    }

    ngOnInit(): any {
        super.ngOnInit();
        this.toolGroup = new FormGroup({});

        this.dirty.subscribeTracked(this, () => {
            this.syncModelAndCode(false);
        });
    }

    openRevision(revisionNumber: number | string) {
        return super.openRevision(revisionNumber).then(() => {
            this.toolGroup.reset();
        });
    }

    switchTab(tabName): void {
        super.switchTab(tabName);

        if (this.jobSubscription) {
            this.jobSubscription.unsubscribe();
            this.jobSubscription = null;
        }

        if (!this.dataModel) return;

        if (tabName === "test") {
            // create the workflow model that will be displayed on the test tab
            this.workflowWrapper = WorkflowFactory.from({cwlVersion: this.dataModel.cwlVersion} as any);
            // add this tool as its only step
            this.workflowWrapper.addStepFromProcess(this.dataModel.serialize());

            // iterate through all inputs of the tool
            this.workflowWrapper.steps[0].in.forEach((input: WorkflowStepInputModel) => {

                if (isType(input, ["File", "Directory"])) {
                    // create inputs from file ports
                    this.workflowWrapper.createInputFromPort(input);
                } else {
                    // everything else should be exposed (show up in the step inspector)
                    this.workflowWrapper.exposePort(input);
                }
            });

            this.workflowWrapper.steps[0].out.forEach((output: WorkflowStepOutputModel) => {
                this.workflowWrapper.createOutputFromPort(output);
            });

            // set job on the tool to be the actual job, so the command line is the real thing
            this.jobSubscription = (this.injector.get(APP_META_MANAGER) as AppMetaManager).getAppMeta("job").subscribeTracked(this, (job) => {
                this.dataModel.setJobInputs(job);
            });
        } else {
            // set dummy values for the job
            this.dataModel.setJobInputs(JobHelper.getJobInputs(this.dataModel));
        }
    }

    protected getPreferredTab(): string {
        return "gui";
    }

    protected getPreferredReportPanel(): string {
        return "commandLinePreview";
    }

    protected recreateModel(json: Object): void {

        this.dataModel = CommandLineToolFactory.from(json as any, "document");
        if (!this.dataModel.namespaces.has("sbg")) {
            this.dataModel.namespaces.set("sbg", "https://www.sevenbridges.com");
        }

        this.dataModel.onCommandLineResult(cmdResult => {
            this.commandLineParts.next(cmdResult);
        });

        this.dataModel.updateCommandLine();
        this.dataModel.setValidationCallback(this.afterModelValidation.bind(this));
        this.dataModel.validate().then(this.afterModelValidation.bind(this));
    }

    onGraphJobEditorDraw(editor: GraphJobEditorComponent) {
        editor.inspectStep(this.workflowWrapper.steps[0].connectionId);
    }
}
