import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
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
import {WorkflowEditorModule} from "../workflow-editor/workflow-editor.module";
import {LayoutTabContentComponent} from "./layout-tab-content/layout-tab-content.component";
import {LayoutComponent} from "./layout/layout.component";
import {LogoComponent} from "./logo/logo.component";
import {AddSourceModalComponent} from "./modals/add-source-modal/add-source-modal.component";
import {SendFeedbackModal} from "./modals/send-feedback-modal/send-feedback.modal.component";
import {AppsPanelComponent} from "./panels/apps-panel/apps-panel.component";
import {MyAppsPanelComponent} from "./panels/my-apps-panel/my-apps-panel.component";
import {NavSearchResultComponent} from "./panels/nav-search-result/nav-search-result.component";
import {PanelContainerComponent} from "./panels/panel-container/panel-container.component";
import {PublicAppsPanelComponent} from "./panels/public-apps-panel/public-apps-panel.component";
import {PlatformConnectionFormComponent} from "./settings/platform-connection-form/platform-connection-form.component";
import {WebWorkerBuilderService} from "./web-worker/web-worker-builder.service";
import {SettingsButtonComponent} from "./workbox/settings-button.component";
import {WorkboxComponent} from "./workbox/workbox.component";
import {AuthModule} from "../auth/auth.module";

@NgModule({
    entryComponents: [
        AddSourceModalComponent,
        SendFeedbackModal
    ],
    declarations: [
        LayoutComponent,
        LogoComponent,
        LayoutTabContentComponent,
        WorkboxComponent,
        SettingsButtonComponent,
        AppsPanelComponent,
        PanelContainerComponent,
        MyAppsPanelComponent,
        PublicAppsPanelComponent,
        NavSearchResultComponent,
        WelcomeTabComponent,
        GettingStartedComponent,
        NewFileTabComponent,
        AddSourceModalComponent,
        SendFeedbackModal,
        PlatformConnectionFormComponent
    ],
    exports: [
        LogoComponent,
        LayoutComponent,
    ],
    providers: [
        GuidService,
        WebWorkerBuilderService,
        ModalService,
        PlatformAPI,
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
        WorkflowEditorModule
    ]
})
export class CoreModule {
}
