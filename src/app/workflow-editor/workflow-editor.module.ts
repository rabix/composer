import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {CWLModule} from "../cwl/cwl.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {LayoutModule} from "../layout/layout.module";
import {UIModule} from "../ui/ui.module";
import {WorkflowGraphEditorComponent} from "./graph-editor/graph-editor/workflow-graph-editor.component";
import {StepInspectorEntry2Component} from "./inspectors/step-inspector/step-inspector-entry/step-inspector-entry.component";
import {InputJobInspectorComponent} from "./object-inspector/input-job-inspector/input-job-inspector.component";
import {WorkflowIOInspectorComponent} from "./object-inspector/io-inspector/workflow-io-inspector.component";
import {StepInputsInspectorComponent} from "./object-inspector/step-inspector/step-inputs-inspector/step-inputs-inspector.component";
import {StepInspectorComponent} from "./object-inspector/step-inspector/step-inspector.component";
import {WorkflowStepInspectorInputEntryComponent} from "./object-inspector/step-inspector/tabs/step-inspector-step-entry";
import {WorkflowStepInspectorTabInfo} from "./object-inspector/step-inspector/tabs/step-tab-info.component";
import {WorkflowStepInspectorTabStep} from "./object-inspector/step-inspector/tabs/step-tab-step.component";
import {WorkflowJobStepInspector} from "./object-inspector/workflow-job-step-inspector/workflow-job-step-inspector.component";
import {UpdateStepModalComponent} from "./update-step-modal/update-step-modal.component";
import {WorkflowEditorComponent} from "./workflow-editor.component";
import {WorkflowJobEditorComponent} from "./workflow-job-editor/workflow-job-editor.component";
import {WorkflowNotGraphEditorComponent} from "./workflow-not-graphic-editor/workflow-not-graph-editor.component";

@NgModule({
    declarations: [
        InputJobInspectorComponent,
        StepInputsInspectorComponent,
        WorkflowJobStepInspector,
        StepInspectorComponent,
        StepInspectorEntry2Component,
        UpdateStepModalComponent,
        WorkflowEditorComponent,
        WorkflowGraphEditorComponent,
        WorkflowIOInspectorComponent,
        WorkflowJobEditorComponent,
        WorkflowNotGraphEditorComponent,
        WorkflowStepInspectorInputEntryComponent,
        WorkflowStepInspectorTabInfo,
        WorkflowStepInspectorTabStep,
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
