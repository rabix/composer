import {CommonModule} from "@angular/common";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MomentModule} from "angular2-moment";
import {UIModule} from "../ui/ui.module";
import {ActionBarComponent} from "./action-bar/action-bar.component";
import {EditorControlsComponent} from "./editor-controls/editor-controls.component";
import {FileEditorComponent} from "./file-editor/file-editor.component";
import {SettingsComponent} from "./settings/settings.component";
import {StatusBarComponent} from "./status-bar/status-bar.component";
import {TabLoaderComponent} from "./tab-loader/tab-loader.component";
import {ExecutorConfigComponent} from "./settings/executor-config/executor-config.component";
import {NotificationBarComponent} from "./notification-bar/notification-bar.component";
import {NotificationBarService} from "./notification-bar/notification-bar.service";

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
        NotificationBarComponent,
        ExecutorConfigComponent
    ],
    exports: [
        ActionBarComponent,
        EditorControlsComponent,
        FileEditorComponent,
        SettingsComponent,
        StatusBarComponent,
        TabLoaderComponent,
        NotificationBarComponent
    ],
    providers: [
        NotificationBarService
    ]
})
export class LayoutModule {
}
