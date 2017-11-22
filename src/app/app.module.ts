import {IpcWebService} from './services/ipc.web.service';
import {NgModule, APP_INITIALIZER} from "@angular/core";
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
import {ConfigurationService} from "./app.config";
import {LoginService} from "./services/login/login.service";
import {LoginComponent} from "./login/login.component";
import {environment} from './../environments/environment';
import {CookieModule} from 'ngx-cookie';

export function initConfiguration(_configurationService: ConfigurationService) {
    if (!environment.browser || !environment.configPath) { return; }
    return () => _configurationService.load(environment.configPath);
}

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
        ConfigurationService,
        {
            'provide': APP_INITIALIZER,
            'useFactory': initConfiguration,
            'deps': [ConfigurationService],
            'multi': true
        },
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

        let rootComponent = "ct-cottontail";
        let InitComponent:any = MainComponent;

        if (environment.browser) {
            this._loginService.storeToken("api_token");
            if (!this._loginService.getToken("api_token")) {
                rootComponent = "login";
                InitComponent = LoginComponent;
            }
        }

        document.body.appendChild(document.createElement(rootComponent));
        app.bootstrap(InitComponent);

    }

}
