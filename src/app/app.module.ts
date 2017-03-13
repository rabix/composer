import {BrowserModule} from "@angular/platform-browser";
import {CoreModule} from "./core/core.module";
import {DomEventService} from "./services/dom/dom-event.service";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {GuidService} from "./services/guid.service";
import {HttpModule} from "@angular/http";
import {IpcService} from "./services/ipc.service";
import {MainComponent} from "./components/main/main.component";
import {NgModule} from "@angular/core";
import {PlatformAPI} from "./services/api/platforms/platform-api.service";
import {SettingsService} from "./services/settings/settings.service";
import {TemplateProviderService} from "./services/template-provider.service";
import {UserPreferencesService} from "./services/storage/user-preferences.service";
import {ToolEditorModule} from "./tool-editor/tool-editor.module";
import {WorkflowEditorModule} from "./workflow-editor/workflow-editor.module";
import {CWLModule} from "./cwl/cwl.module";
import {EditorCommonModule} from "./editor-common/editor-common.module";
import {LayoutComponent} from "./core/layout/layout.component";
import {UIModule} from "./ui/ui.module";

@NgModule({
    providers: [
        FormBuilder,
        TemplateProviderService,
        UserPreferencesService,
        DomEventService,
        GuidService,
        IpcService,
        SettingsService,
        PlatformAPI,
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
