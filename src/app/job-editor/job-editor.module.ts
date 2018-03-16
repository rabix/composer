import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UIModule} from "../ui/ui.module";
import {GraphJobEditorComponent} from "./graph-job-editor/graph-job-editor.component";
import {JobStepInspectorComponent} from "./graph-job-editor/job-step-inspector/job-step-inspector.component";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {StoreModule} from "@ngrx/store";
import {reducers} from "../execution/reducers";

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        UIModule,
        EditorCommonModule,
        // FIXME: should not use reducers from other modules
        StoreModule.forFeature("jobEditor", reducers)
    ],
    declarations: [
        GraphJobEditorComponent,
        JobStepInspectorComponent,
    ],
    exports: [
        GraphJobEditorComponent,
    ],
})
export class JobEditorModule {
}
