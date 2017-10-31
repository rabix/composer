import {ErrorHandler, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {NgStringPipesModule} from "ngx-pipes";
import {environment} from "../../environments/environment";
import {AuthModule} from "../auth/auth.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {ExecutorService} from "../executor/executor.service";
import {LayoutModule} from "../layout/layout.module";
import {ToolEditorModule} from "../tool-editor/tool-editor.module";
import {MarkdownService} from "../ui/markdown/markdown.service";
import {ModalService} from "../ui/modal/modal.service";
import {UIModule} from "../ui/ui.module";
import {WorkflowEditorModule} from "../workflow-editor/workflow-editor.module";
import {ErrorReportComponent} from "./error-report/error-report.component";
import {ModalErrorHandler} from "./error-report/modal-error-handler";
import {LayoutComponent} from "./layout/layout.component";
import {LayoutService} from "./layout/layout.service";
import {LogoComponent} from "./logo/logo.component";
import {AboutPageModalComponent} from "./modals/about-page-modal/about-page-modal.component";
import {AddSourceModalComponent} from "./modals/add-source-modal/add-source-modal.component";
import {CreateAppModalComponent} from "./modals/create-app-modal/create-app-modal.component";
import {CreateLocalFolderModalComponent} from "./modals/create-local-folder-modal/create-local-folder-modal.component";
import {HintsModalComponent} from "./modals/hints-modal/hints-modal.component";
import {PlatformCredentialsModalComponent} from "./modals/platform-credentials-modal/platform-credentials-modal.component";
import {ProceedToEditingModalComponent} from "./modals/proceed-to-editing-modal/proceed-to-editing-modal.component";
import {PublishModalComponent} from "./modals/publish-modal/publish-modal.component";
import {SendFeedbackModalComponent} from "./modals/send-feedback-modal/send-feedback.modal.component";
import {UpdatePlatformModalComponent} from "./modals/update-platform-modal/update-platform-modal.component";
import {GettingStartedComponent} from "./onboarding/getting-started.component";
import {WelcomeTabComponent} from "./onboarding/welcome.component";
import {AppsPanelComponent} from "./panels/apps-panel/apps-panel.component";
import {MyAppsPanelComponent} from "./panels/my-apps-panel/my-apps-panel.component";
import {NavSearchResultComponent} from "./panels/nav-search-result/nav-search-result.component";
import {PanelContainerComponent} from "./panels/panel-container/panel-container.component";
import {PublicAppsPanelComponent} from "./panels/public-apps-panel/public-apps-panel.component";
import {NewFileTabComponent} from "./tab-components/new-file-tab.component/new-file-tab.component";
import {WebWorkerBuilderService} from "./web-worker/web-worker-builder.service";
import {SettingsMenuComponent} from "./workbox/settings-menu.component";
import {WorkBoxTabComponent} from "./workbox/workbox-tab.component";
import {WorkBoxComponent} from "./workbox/workbox.component";
import {WorkboxService} from "./workbox/workbox.service";
import {ClosingDirtyAppsModalComponent} from "./modals/closing-dirty-apps/closing-dirty-apps-modal.component";

export function errorHandlerFactory(modal: ModalService) {
    return environment.production ? new ModalErrorHandler(modal) : new ErrorHandler();
}

@NgModule({
    entryComponents: [
        AboutPageModalComponent,
        AddSourceModalComponent,
        SendFeedbackModalComponent,
        ErrorReportComponent,
        CreateAppModalComponent,
        CreateLocalFolderModalComponent,
        ProceedToEditingModalComponent,
        PublishModalComponent,
        HintsModalComponent,
        PlatformCredentialsModalComponent,
        UpdatePlatformModalComponent,
        ClosingDirtyAppsModalComponent
    ],
    declarations: [
        AboutPageModalComponent,
        LayoutComponent,
        LogoComponent,
        WorkBoxComponent,
        WorkBoxTabComponent,
        SettingsMenuComponent,
        AppsPanelComponent,
        PanelContainerComponent,
        MyAppsPanelComponent,
        PublicAppsPanelComponent,
        NavSearchResultComponent,
        WelcomeTabComponent,
        GettingStartedComponent,
        NewFileTabComponent,
        AddSourceModalComponent,
        SendFeedbackModalComponent,
        ErrorReportComponent,
        CreateAppModalComponent,
        CreateLocalFolderModalComponent,
        ProceedToEditingModalComponent,
        PublishModalComponent,
        HintsModalComponent,
        PlatformCredentialsModalComponent,
        UpdatePlatformModalComponent,
        ClosingDirtyAppsModalComponent
    ],
    exports: [
        LogoComponent,
        LayoutComponent
    ],
    providers: [
        WebWorkerBuilderService,
        WorkboxService,
        ModalService,
        LayoutService,
        ExecutorService,
        MarkdownService,
        {
            provide: ErrorHandler,
            useFactory: errorHandlerFactory,
            deps: [ModalService]
        }
    ],
    imports: [
        BrowserModule,
        LayoutModule,
        FormsModule,
        ReactiveFormsModule,
        AuthModule,
        UIModule,
        EditorCommonModule,
        ToolEditorModule,
        WorkflowEditorModule,
        NgStringPipesModule
    ]
})
export class CoreModule {
}
