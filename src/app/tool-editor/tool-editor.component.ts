import {Component, EventEmitter, Injector, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {
    CommandLineToolModel,
    isType,
    WorkflowFactory,
    WorkflowModel,
    WorkflowStepInputModel,
    WorkflowStepOutputModel,
    CommandInputParameterModel
} from "cwlts/models";
import {CommandLineToolFactory} from "cwlts/models/generic/CommandLineToolFactory";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import {JobHelper} from "cwlts/models/helpers/JobHelper";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
import {AppMetaManager} from "../core/app-meta/app-meta-manager";
import {AppMetaManagerToken, appMetaManagerFactory} from "../core/app-meta/app-meta-manager-factory";
import {CodeSwapService} from "../core/code-content-service/code-content.service";
import {DataGatewayService} from "../core/data-gateway/data-gateway.service";
import {AppModelToken, appModelFactory} from "../core/factories/app-model-provider-factory";
import {WorkboxService} from "../core/workbox/workbox.service";
import {AppEditorBase} from "../editor-common/app-editor-base/app-editor-base";
import {AppValidatorService} from "../editor-common/app-validator/app-validator.service";
import {PlatformAppService} from "../editor-common/components/platform-app-common/platform-app.service";
import {GraphJobEditorComponent} from "../job-editor/graph-job-editor/graph-job-editor.component";
import {EditorInspectorService} from "../editor-common/inspector/editor-inspector.service";
import {AppSaverToken} from "../editor-common/services/app-saving/app-saver.interface";
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
import {AppInfoToken, appInfoFactory, AppInfo} from "../editor-common/factories/app-info.factory";
import {AppState} from "./reducers";
import {appTestData} from "./reducers/selectors";
import {fixJob} from "../editor-common/utilities/job-adapter/job-adapter";
import {take} from "rxjs/operators";
import {
    AppMockValuesChange,
    LoadTestJobAction,
    InputTestValueChangeAction,
    InputRemoveAction,
    InputIDChangeAction
} from "./reducers/actions";
import {fromEvent} from "rxjs/observable/fromEvent";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {RevisionListComponent} from "../editor-common/components/revision-list/revision-list.component";

export function appSaverFactory(comp: ToolEditorComponent, ipc: IpcService, modal: ModalService, platformRepository: PlatformRepositoryService) {

    if (comp.tabData.dataSource === "local") {
        return new LocalFileSavingService(ipc);
    }

    return new PlatformAppSavingService(platformRepository, modal);
}

@Component({
    selector: "ct-tool-editor",
    styleUrls: ["../editor-common/app-editor-base/app-editor-base.scss"],
    templateUrl: "./tool-editor.component.html",
    providers: [
        EditorInspectorService,
        NotificationBarService,
        CodeSwapService,
        PlatformAppService,
        {
            provide: AppSaverToken,
            useFactory: appSaverFactory,
            deps: [ToolEditorComponent, IpcService, ModalService, PlatformRepositoryService]
        }, {
            provide: AppMetaManagerToken,
            useFactory: appMetaManagerFactory,
            deps: [ToolEditorComponent, LocalRepositoryService, PlatformRepositoryService]
        },
        {
            provide: AppModelToken,
            useFactory: appModelFactory,
            deps: [ToolEditorComponent]
        },
        {
            provide: AppInfoToken,
            useFactory: appInfoFactory,
            deps: [ToolEditorComponent]
        }
    ]
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

    private testJob = new BehaviorSubject({});

    private appID: string;

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
                public store: Store<AppState>,
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
        const appInfo = this.injector.get(AppInfoToken) as AppInfo;
        this.appID    = appInfo.id;

        this.toolGroup = new FormGroup({});

        this.dirty.subscribeTracked(this, () => {
            this.syncModelAndCode(false);
        });

        this.store.select(appTestData(this.appID)).subscribeTracked(this, this.testJob);
    }

    openRevision(revisionNumber: number | string, revisionListComponent: RevisionListComponent) {
        return super.openRevision(revisionNumber, revisionListComponent).then(() => {
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
            const step = this.workflowWrapper.addStepFromProcess(this.dataModel.serialize());
            /**
             * Adding a step sometimes generates a different id for that step than that of an app that it was made from.
             * On graph job representation, step progress plugin knows about tool id, and will try to update execution state on it.
             * If this representation has a different id, they will not match and step will not be found on the SVG.
             * This is a place to fix that since this workflow is not a source of truth for the data, but just a utility
             * to help us render a graph, so just patch the ID to ensure that it's exactly what we expect to find.
             */
            this.workflowWrapper.changeStepId(step, this.dataModel.id);

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
            this.jobSubscription = (this.injector.get(AppMetaManagerToken) as AppMetaManager).getAppMeta("job").subscribeTracked(this, (job) => {
                this.dataModel.setJobInputs(job);
            });
        } else {
            this.dataModel.setJobInputs(this.testJob.getValue());
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


    protected afterModelCreated(isFirstCreation: boolean): void {
        super.afterModelCreated(isFirstCreation);

        if (isFirstCreation) {
            // Backend might have a stored test job that we should load
            // This is implemented as a side effect because if it doesn't happen, it's not a big deal
            this.store.dispatch(new LoadTestJobAction(this.appID));
        }

        // When we get the first result from a test job, ensure that it conforms to the model that we have
        this.testJob.pipe(take(1)).subscribe(data => {
            this.store.dispatch(new AppMockValuesChange(this.appID, fixJob(data, this.dataModel)));
        });

        this.testJob.subscribe(job => this.dataModel.setJobInputs(job));

        this.dataModel.on("input.create", (input: CommandInputParameterModel) => {
            // When input is created it emits an event, but its type is set afterwards from Composer
            // So we will wait just a bit before generating a job value so it knows that the type is not undefined
            setTimeout(() => {
                const jobData = JobHelper.generateMockJobData(input);
                this.store.dispatch(new InputTestValueChangeAction(this.appID, input.id, jobData));
            });
        });

        this.dataModel.on("input.remove", input => {
            this.store.dispatch(new InputRemoveAction(this.appID, input.id));
        });

        this.dataModel.on("input.change.id", (data: { oldId: string; newId: string; port: CommandInputParameterModel }) => {
            const {oldId, newId, port} = data;
            // We want to react to root input id changes and migrate data, for nested stuff, just regenerate for now
            if (port.loc && port.loc.split(".").length === 2) {
                this.store.dispatch(new InputIDChangeAction(this.appID, oldId, newId));
            } else {
                const fixed = fixJob(this.testJob.getValue(), this.dataModel);
                this.store.dispatch(new AppMockValuesChange(this.appID, fixed));
            }
        });

        fromEvent(this.dataModel, "io.change.type").subscribe((loc: string) => {
            setTimeout(() => {
                const fixed = fixJob(this.testJob.getValue(), this.dataModel);
                this.store.dispatch(new AppMockValuesChange(this.appID, fixed));
            });
        });
    }

    onGraphJobEditorDraw(editor: GraphJobEditorComponent) {
        editor.inspectStep(this.workflowWrapper.steps[0].connectionId);
    }

}
