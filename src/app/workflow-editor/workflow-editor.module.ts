import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {CWLModule} from "../cwl/cwl.module";
import {StepInspectorComponent} from "./object-inspector/step-inspector/step-inspector.component";
import {WorkflowStepInspectorTabInputsComponent} from "./object-inspector/step-inspector/tabs/step-tab-inputs.component";
import {WorkflowStepInspectorTabInfo} from "./object-inspector/step-inspector/tabs/step-tab-info.component";
import {WorkflowStepInspectorTabStep} from "./object-inspector/step-inspector/tabs/step-tab-step.component";
import {WorkflowStepInspectorInputEntry} from "./object-inspector/step-inspector/tabs/step-inspector-step-entry";
import {WorkflowEditorComponent} from "./workflow-editor.component";
import {WorkflowNotGraphEditorComponent} from "./workflow-not-graphic-editor/workflow-not-graph-editor.component";
import {WorkflowIOInspectorComponent} from "./object-inspector/io-inspector/workflow-io-inspector.component";
import {WorkflowGraphEditorComponent} from "./graph-editor/graph-editor/workflow-graph-editor.component";
import {UIModule} from "../ui/ui.module";
import {LayoutModule} from "../layout/layout.module";
import {UpdateStepModalComponent} from "./update-step-modal/update-step-modal.component";

@NgModule({
    declarations: [
        WorkflowEditorComponent,
        WorkflowGraphEditorComponent,
        WorkflowNotGraphEditorComponent,
        WorkflowIOInspectorComponent,
        StepInspectorComponent,
        WorkflowStepInspectorInputEntry,
        WorkflowStepInspectorTabInputsComponent,
        WorkflowStepInspectorTabInfo,
        WorkflowStepInspectorTabStep,
        UpdateStepModalComponent
    ],
    entryComponents: [
      UpdateStepModalComponent,
    ],
    exports: [
        WorkflowEditorComponent
    ],
    imports: [
        BrowserModule,
        CWLModule,
        EditorCommonModule,
        LayoutModule,
        FormsModule,
        ReactiveFormsModule,
        UIModule,
    ]
})
export class WorkflowEditorModule {

}
