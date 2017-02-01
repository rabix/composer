import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CoreModule} from "../core/core.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {CWLModule} from "../cwl/cwl.module";
import {WorkflowStepInspector} from "./object-inspector/step-inspector/step-inspector.component";
import {WorkflowEditorComponent} from "./workflow-editor.component";
import {WorkflowGraphEditorComponent} from "./workflow-graphic-editor/workflow-graph-editor.component";

@NgModule({
    declarations: [
        WorkflowEditorComponent,
        WorkflowGraphEditorComponent,
        WorkflowStepInspector
    ],
    exports: [
        WorkflowEditorComponent
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
