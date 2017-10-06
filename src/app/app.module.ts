import {IpcWebService} from './services/ipc.web.service';
import {NgModule} from "@angular/core";
import {FormBuilder, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpModule} from "@angular/http";
import {BrowserModule} from "@angular/platform-browser";
import "rxjs/Rx";
import {AuthService} from "./auth/auth.service";
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
import {LoginService} from "./services/login/login.service";
import {LoginComponent} from "./login/login.component";
import {environment} from './../environments/environment';
import {CookieModule} from 'ngx-cookie';

@NgModule({
    providers: [
        AuthService,
        DataGatewayService,
        DomEventService,
        FileRepositoryService,
        FormBuilder,
        GlobalService,
        IpcWebService,
        IpcService,
        JavascriptEvalService,
        LocalRepositoryService,
        ModalService,
        PlatformConnectionService,
        PlatformRepositoryService,
        SettingsService,
        StatusBarService,
        LoginService,
    ],
    declarations: [
        MainComponent,
        LoginComponent,
    ],
    entryComponents: [
        MainComponent,
        LoginComponent,
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
        NativeModule,
        CookieModule.forRoot(),
    ],
})
export class AppModule {

    constructor(private _loginService: LoginService) {}

    ngDoBootstrap(app) {
        this._loginService.storeToken();

        if (!environment.browser || this._loginService.getToken()) {
            let cottonTailComponent = document.createElement("ct-cottontail");
            document.body.appendChild(cottonTailComponent);

            app.bootstrap(MainComponent);
        } else {
            let loginComponent = document.createElement("login");
            document.body.appendChild(loginComponent);

            app.bootstrap(LoginComponent);
        }
    }

}
