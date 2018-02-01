import {NgModule} from "@angular/core";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import "rxjs/Rx";
import {AuthService, CREDENTIALS_REGISTRY} from "./auth/auth.service";
import {MainComponent} from "./components/main/main.component";
import {PlatformConnectionService} from "./core/auth/platform-connection.service";
import {CoreModule} from "./core/core.module";
import {DataGatewayService} from "./core/data-gateway/data-gateway.service";
import {GlobalService} from "./core/global/global.service";
import {CWLModule} from "./cwl/cwl.module";
import {EditorCommonModule} from "./editor-common/editor-common.module";
import {FileRepositoryService} from "./file-repository/file-repository.service";
import {StatusBarService} from "./layout/status-bar/status-bar.service";
import {NativeModule} from "./native/native.module";
import {LocalRepositoryService} from "./repository/local-repository.service";
import {PlatformRepositoryService} from "./repository/platform-repository.service";
import {DomEventService} from "./services/dom/dom-event.service";
import {IpcService} from "./services/ipc.service";
import {JavascriptEvalService} from "./services/javascript-eval/javascript-eval.service";
import {SettingsService} from "./services/settings/settings.service";
import {ToolEditorModule} from "./tool-editor/tool-editor.module";
import {ModalService} from "./ui/modal/modal.service";
import {UIModule} from "./ui/ui.module";
import {WorkflowEditorModule} from "./workflow-editor/workflow-editor.module";
import {OpenExternalFileService} from "./core/open-external-file/open-external-file.service";
import {ExportAppService} from "./services/export-app/export-app.service";
import {StoreModule} from "@ngrx/store";
import {EffectsModule} from "@ngrx/effects";
import {FileOpenerToken, DirectoryExplorerToken} from "./execution/interfaces";
import {NativeSystemService} from "./native/system/native-system.service";
import {WorkboxService} from "./core/workbox/workbox.service";
import {directoryExplorerFactory, fileOpenerFactory} from "./factories/execution";

@NgModule({
    providers: [
        {
            provide: CREDENTIALS_REGISTRY,
            useClass: LocalRepositoryService
        },
        AuthService,
        DataGatewayService,
        DomEventService,
        ExportAppService,
        FileRepositoryService,
        FormBuilder,
        GlobalService,
        IpcService,
        JavascriptEvalService,
        LocalRepositoryService,
        OpenExternalFileService,
        ModalService,
        PlatformConnectionService,
        PlatformRepositoryService,
        SettingsService,
        StatusBarService,
        {
            provide: DirectoryExplorerToken,
            useFactory: directoryExplorerFactory,
            deps: [NativeSystemService]
        },
        {
            provide: FileOpenerToken,
            useFactory: fileOpenerFactory,
            deps: [WorkboxService]
        }
    ],
    declarations: [
        MainComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        CoreModule,
        ReactiveFormsModule,
        UIModule,
        CWLModule,
        EditorCommonModule,
        ToolEditorModule,
        WorkflowEditorModule,
        NativeModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([])

    ],
    bootstrap: [MainComponent]
})
export class AppModule {

}
