import {Component, Injector, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {CommandLineToolFactory} from "cwlts/models/generic/CommandLineToolFactory";
import {CommandLinePart} from "cwlts/models/helpers/CommandLinePart";

import "rxjs/add/observable/combineLatest";
import "rxjs/add/operator/skip";
import "rxjs/add/operator/take";
import {ReplaySubject} from "rxjs/ReplaySubject";
import {Subject} from "rxjs/Subject";
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
import {IpcService} from "../services/ipc.service";
import {ModalService} from "../ui/modal/modal.service";
import "../util/rx-extensions/subscribe-tracked";
import {PlatformRepositoryService} from "../repository/platform-repository.service";
import {CommandLineToolModel} from "cwlts/models";

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
            useFactory(comp: ToolEditorComponent, ipc: IpcService, modal: ModalService, platformRepository: PlatformRepositoryService) {

                if (comp.tabData.dataSource === "local") {
                    return new LocalFileSavingService(ipc);
                }

                return new PlatformAppSavingService(platformRepository, modal);
            },
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

    /** Sorted array of resulting command line parts */
    commandLineParts: Subject<CommandLinePart[]> = new ReplaySubject();

    toolGroup: FormGroup;


    constructor(statusBar: StatusBarService,
                errorBar: NotificationBarService,
                modal: ModalService,
                inspector: EditorInspectorService,
                dataGateway: DataGatewayService,
                injector: Injector,
                appValidator: AppValidatorService,
                codeSwapService: CodeSwapService,
                platformAppService: PlatformAppService) {
        super(statusBar, errorBar, modal, inspector, dataGateway, injector, appValidator, codeSwapService, platformAppService);
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

    resetJob() {
        this.dataModel.resetJobDefaults();
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
    }
}
