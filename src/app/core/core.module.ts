import {ErrorHandler, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {PublishModalComponent} from "app/core/modals/publish-modal/publish-modal.component";
import {NgStringPipesModule} from "ngx-pipes";
import {AuthModule} from "../auth/auth.module";
import {GettingStartedComponent} from "../components/onboarding/getting-started.component";
import {NewFileTabComponent} from "../components/onboarding/new-file.component";
import {WelcomeTabComponent} from "../components/onboarding/welcome.component";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {LayoutModule} from "../layout/layout.module";
import {PlatformAPI} from "../services/api/platforms/platform-api.service";
import {GuidService} from "../services/guid.service";
import {ToolEditorModule} from "../tool-editor/tool-editor.module";
import {ModalService} from "../ui/modal/modal.service";
import {UIModule} from "../ui/ui.module";
import {AddSourceModalComponent} from "./modals/add-source-modal/add-source-modal.component";
import {ErrorReportComponent} from "./error-report/error-report.component";
import {CreateLocalFolderModalComponent} from "./modals/create-local-folder-modal/create-local-folder-modal.component";
import {PlatformCredentialsModalComponent} from "./modals/platform-credentials-modal/platform-credentials-modal.component";
import {LayoutComponent} from "./layout/layout.component";
import {LogoComponent} from "./logo/logo.component";
import {SettingsMenuComponent} from "./workbox/settings-menu.component";
import {AppsPanelComponent} from "./panels/apps-panel/apps-panel.component";
import {MyAppsPanelComponent} from "./panels/my-apps-panel/my-apps-panel.component";
import {PublicAppsPanelComponent} from "./panels/public-apps-panel/public-apps-panel.component";
import {NavSearchResultComponent} from "./panels/nav-search-result/nav-search-result.component";
import {WorkBoxComponent} from "./workbox/workbox.component";
import {WorkBoxTabComponent} from "./workbox/workbox-tab.component";
import {PanelContainerComponent} from "./panels/panel-container/panel-container.component";
import {SendFeedbackModalComponent} from "./modals/send-feedback-modal/send-feedback.modal.component";
import {CreateAppModalComponent} from "./modals/create-app-modal/create-app-modal.component";
import {WebWorkerBuilderService} from "./web-worker/web-worker-builder.service";
import {WorkboxService} from "./workbox/workbox.service";
import {LayoutService} from "./layout/layout.service";
import {ModalErrorHandler} from "./error-report/modal-error-handler";
import {WorkflowEditorModule} from "../workflow-editor/workflow-editor.module";
import {ProceedToEditingModalComponent} from "./modals/proceed-to-editing-modal/proceed-to-editing-modal.component";
import {HintsModalComponent} from "./modals/hints-modal/hints-modal.component";

@NgModule({
    entryComponents: [
        AddSourceModalComponent,
        SendFeedbackModalComponent,
        ErrorReportComponent,
        CreateAppModalComponent,
        CreateLocalFolderModalComponent,
        ProceedToEditingModalComponent,
        PublishModalComponent,
        HintsModalComponent,
        PlatformCredentialsModalComponent,
    ],
    declarations: [
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
        PlatformCredentialsModalComponent
    ],
    exports: [
        LogoComponent,
        LayoutComponent,
    ],
    providers: [
        GuidService,
        WebWorkerBuilderService,
        WorkboxService,
        ModalService,
        LayoutService,
        PlatformAPI,
        // {provide: ErrorHandler, useClass: ModalErrorHandler}
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
