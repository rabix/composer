import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MomentModule} from "angular2-moment";
import {EditorControlsComponent} from "./editor-controls/editor-controls.component";
import {FileEditorComponent} from "./file-editor/file-editor.component";
import {SettingsComponent} from "./settings/settings.component";
import {StatusBarComponent} from "./status-bar/status-bar.component";
import {UIModule} from "../ui/ui.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ActionBarComponent} from "./action-bar/action-bar.component";
import { TabLoaderComponent } from "./tab-loader/tab-loader.component";
import {ErrorBarComponent} from "./error-bar/error-bar.component";
import {ErrorBarService} from "./error-bar/error-bar.service";
import {CredentialsFormComponent} from "./credentials-form/credentials-form.component";

@NgModule({
    imports: [
        CommonModule,
        MomentModule,
        FormsModule,
        ReactiveFormsModule,
        UIModule
    ],
    declarations: [
        ActionBarComponent,
        EditorControlsComponent,
        FileEditorComponent,
        SettingsComponent,
        StatusBarComponent,
        TabLoaderComponent,
        ErrorBarComponent,
        CredentialsFormComponent,
    ],
    exports: [
        ActionBarComponent,
        EditorControlsComponent,
        FileEditorComponent,
        SettingsComponent,
        StatusBarComponent,
        TabLoaderComponent,
        ErrorBarComponent,
        CredentialsFormComponent
    ],
    providers: [
        ErrorBarService
    ]
})
export class LayoutModule {
}
