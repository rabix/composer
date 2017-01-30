import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CoreModule} from "../core/core.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {WorkflowGraphEditorComponent} from "./workflow-graph-editor.component";
import {CWLModule} from "../cwl/cwl.module";
import {WorkflowStepInspector} from "./object-inspector/step-inspector/step-inspector.component";

@NgModule({
    declarations: [
        WorkflowGraphEditorComponent,
        WorkflowStepInspector
    ],
    exports: [
        WorkflowGraphEditorComponent,
        WorkflowStepInspector
    ],
    imports: [
        BrowserModule,
        CoreModule,
        CWLModule,
        EditorCommonModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class WorkflowEditorModule {

}
