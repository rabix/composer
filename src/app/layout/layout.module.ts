import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MomentModule} from "angular2-moment";
import {EditorControlsComponent} from "./editor-controls/editor-controls.component";
import {FileEditorComponent} from "./file-editor/file-editor.component";
import {SettingsComponent} from "./settings/settings.component";
import {StatusBarComponent} from "./status-bar/status-bar.component";
import {UIModule} from "../ui/ui.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@NgModule({
    imports: [
        CommonModule,
        MomentModule,
        FormsModule,
        ReactiveFormsModule,
        UIModule
    ],
    declarations: [
        EditorControlsComponent,
        FileEditorComponent,
        SettingsComponent,
        StatusBarComponent,
    ],
    exports: [
        EditorControlsComponent,
        FileEditorComponent,
        SettingsComponent,
        StatusBarComponent,
    ]
})
export class LayoutModule {
}
