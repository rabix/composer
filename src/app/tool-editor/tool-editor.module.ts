import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CoreModule} from "../core/core.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {ArgumentListComponent} from "./sections/arguments/argument-list.component";
import {FileDefListComponent} from "./sections/file-def-list/file-def-list.component";
import {ResourcesComponent} from "./sections/resources/resources.component";
import {ToolInputListComponent} from "./sections/inputs/tool-input-list.component";
import {CWLModule} from "../cwl/cwl.module";
import {ToolInputInspector} from "./sections/inputs/tool-input-inspector.component";
import {ArgumentInspector} from "./sections/arguments/argument-inspector.component";


@NgModule({
    declarations: [
        ArgumentListComponent,
        ArgumentInspector,
        FileDefListComponent,
        ToolInputListComponent,
        ToolInputInspector,
        ResourcesComponent
    ],
    exports: [
        ArgumentListComponent,
        ArgumentInspector,
        FileDefListComponent,
        ResourcesComponent,
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
