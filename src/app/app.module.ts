import {NgModule} from "@angular/core";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {BrowserModule} from "@angular/platform-browser";
import {PlatformAPIGatewayService} from "./auth/api/platform-api-gateway.service";
import {AuthService} from "./auth/auth/auth.service";
import {MainComponent} from "./components/main/main.component";
import {PlatformConnectionService} from "./core/auth/platform-connection.service";
import {CoreModule} from "./core/core.module";
import {DataGatewayService} from "./core/data-gateway/data-gateway.service";
import {CWLModule} from "./cwl/cwl.module";
import {EditorCommonModule} from "./editor-common/editor-common.module";
import {PlatformAPI} from "./services/api/platforms/platform-api.service";
import {DomEventService} from "./services/dom/dom-event.service";
import {GuidService} from "./services/guid.service";
import {IpcService} from "./services/ipc.service";
import {SettingsService} from "./services/settings/settings.service";
import {UserPreferencesService} from "./services/storage/user-preferences.service";
import {TemplateProviderService} from "./services/template-provider.service";
import {ToolEditorModule} from "./tool-editor/tool-editor.module";
import {UIModule} from "./ui/ui.module";
import {WorkflowEditorModule} from "./workflow-editor/workflow-editor.module";

@NgModule({
    providers: [
        FormBuilder,
        TemplateProviderService,
        UserPreferencesService,
        DomEventService,
        GuidService,
        IpcService,
        PlatformAPI,
        SettingsService,
        PlatformConnectionService,
        PlatformAPIGatewayService,
        DataGatewayService,
        AuthService
    ],
    declarations: [
        MainComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        CoreModule,
        ReactiveFormsModule,
        UIModule,
        CWLModule,
        EditorCommonModule,
        ToolEditorModule,
        WorkflowEditorModule,
    ],
    bootstrap: [MainComponent]
})
export class AppModule {
}
