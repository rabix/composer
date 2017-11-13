import {Component, Injector, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {
    CommandInputParameterModel, CommandLineToolModel, isFileType, WorkflowFactory,
    WorkflowModel, WorkflowStepInputModel
} from "cwlts/models";
import {CommandLineToolFactory} from "cwlts/models/generic/CommandLineToolFactory";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
import {CodeSwapService} from "../core/code-content-service/code-content.service";
import {DataGatewayService} from "../core/data-gateway/data-gateway.service";
import {WorkboxService} from "../core/workbox/workbox.service";
import {AppEditorBase} from "../editor-common/app-editor-base/app-editor-base";
import {AppValidatorService} from "../editor-common/app-validator/app-validator.service";
import {PlatformAppService} from "../editor-common/components/platform-app-common/platform-app.service";
import {EditorInspectorService} from "../editor-common/inspector/editor-inspector.service";
import {APP_SAVER_TOKEN} from "../editor-common/services/app-saving/app-saver.interface";
import {LocalFileSavingService} from "../editor-common/services/app-saving/local-file-saving.service";
import {PlatformAppSavingService} from "../editor-common/services/app-saving/platform-app-saving.service";
import {ExecutorService} from "../executor/executor.service";
import {NotificationBarService} from "../layout/notification-bar/notification-bar.service";
import {StatusBarService} from "../layout/status-bar/status-bar.service";
import {PlatformRepositoryService} from "../repository/platform-repository.service";
import {IpcService} from "../services/ipc.service";
import {ModalService} from "../ui/modal/modal.service";
import {LocalRepositoryService} from "../repository/local-repository.service";
import {Process} from "cwlts/models/generic/Process";

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
                workbox: WorkboxService,
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
            workbox,
            executor
        );
    }

    ngOnInit(): any {
        super.ngOnInit();
        this.toolGroup = new FormGroup({});
    }

    openRevision(revisionNumber: number | string) {
        return super.openRevision(revisionNumber).then(() => this.toolGroup.reset());
    }

    onJobUpdate(job) {
        this.dataModel.setJobInputs(job.inputs);
        this.dataModel.setRuntime(job.allocatedResources);
        this.dataModel.updateCommandLine();
    }

    protected getPreferredTab(): string {
        return "gui";
    }

    protected getPreferredReportPanel(): string {
        return "commandLinePreview";
    }

    protected recreateModel(json: Object): void {

        this.dataModel = CommandLineToolFactory.from(json as any, "document");

        this.dataModel.onCommandLineResult(cmdResult => {
            this.commandLineParts.next(cmdResult);
        });

        this.dataModel.updateCommandLine();
        this.dataModel.setValidationCallback(this.afterModelValidation.bind(this));
        this.dataModel.validate().then(this.afterModelValidation.bind(this));

        // @fixme(batic): move this somewhere more optimal and useful
        this.workflowWrapper = WorkflowFactory.from({cwlVersion: this.dataModel.cwlVersion} as any);
        this.workflowWrapper.addStepFromProcess(json as Process);
        this.workflowWrapper.steps[0].in.forEach((input: WorkflowStepInputModel) => {

            if (isFileType(input)) {
                this.workflowWrapper.createInputFromPort(input);
            } else {
                this.workflowWrapper.exposePort(input);
            }
        });
    }
}
