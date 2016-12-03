import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {CoreModule} from "../core/core.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {ArgumentListComponent} from "./sections/arguments/argument-list.component";
import {FileDefListComponent} from "./sections/file-def-list/file-def-list.component";
import {ToolInputListComponent} from "./sections/inputs/tool-input-list.component";
import {CWLModule} from "../cwl/cwl.module";
import {ToolInputInspector} from "./sections/inputs/tool-input-inspector.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";


@NgModule({
    declarations: [
        ArgumentListComponent,
        FileDefListComponent,
        ToolInputListComponent,
        ToolInputInspector,
    ],
    exports: [
        ArgumentListComponent,
        FileDefListComponent,
        ToolInputListComponent,
        ToolInputInspector,
    ],
    imports: [
        BrowserModule,
        CoreModule,
        CWLModule,
        EditorCommonModule,
        ReactiveFormsModule,
        FormsModule,
    ]
})
export class ToolEditorModule {

}