import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {BlankToolStateComponent} from "./components/blank-tool-state.component";
import {EditorInspectorComponent} from "./inspector/editor-inspector.component";
import {EditorInspectorContentComponent} from "./inspector/editor-inspector-content.component";
import {EditorInspectorDirective} from "./inspector/editor-inspector.directive";
import {QuickPickComponent} from "./components/quick-pick/quick-pick.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ExpressionEditorComponent} from "./expression-editor/expression-editor.component";
import {FileDefContentPipe} from "./pipes/file-def-content.pipe";
import {FileDefNamePipe} from "./pipes/file-def-name.pipe";
import {ToggleComponent} from "./components/toggle-slider/toggle-slider.component";
import {ExpressionInputComponent} from "./components/expression-input/expression-input.component";
import {CoreModule} from "../core/core.module";
import {ModelExpressionEditorComponent} from "./expression-editor/model-expression-editor.component";
import {ExpressionInputComponent} from "./components/expression-input/expression-input.component";
import {CompactListComponent} from "./components/compact-list/compact-list.component";
import {EditableDirective} from "./directives/editable.directive";
import {ExpressionModelListComponent} from "./components/expression-model-list/expression-model-list.component";
import {ValidationComponent} from "./components/validation-preview/validation-preview.component";
import {ValidationTextPipe} from "./pipes/validation-text.pipes";
import {ValidationClassDirective} from "./components/validation-preview/validation-class.directive";
import {EditorControlsComponent} from "./components/editor-controls/editor-controls.component";
import {RevisionListComponent} from "./components/revision-list/revision-list.component";
import {KeyValueInputComponent} from "./components/key-value-component/key-value-input.component";
import {KeyValueListComponent} from "./components/key-value-component/key-value-list.component";

@NgModule({
    declarations: [
        BlankToolStateComponent,
        EditorControlsComponent,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        EditorInspectorDirective,
        ExpressionEditorComponent,
        ExpressionInputComponent,
        ExpressionInputComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        ModelExpressionEditorComponent,
        QuickPickComponent,
        ToggleComponent,
        ValidationClassDirective,
        ValidationComponent,
        ValidationTextPipe,
        RevisionListComponent
    ],
    exports: [
        BlankToolStateComponent,
        EditorControlsComponent,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        EditorInspectorDirective,
        ExpressionEditorComponent,
        ExpressionInputComponent,
        ExpressionInputComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        ToggleComponent,
        ModelExpressionEditorComponent,
        QuickPickComponent,
        ToggleComponent,
        ValidationClassDirective,
        CompactListComponent,
        EditableDirective,
        ExpressionModelListComponent,
        QuickPickComponent,
        ValidationComponent,
        RevisionListComponent,
        ValidationClassDirective,
        KeyValueInputComponent,
        KeyValueListComponent
    ],
    entryComponents: [
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        ExpressionEditorComponent,
        ModelExpressionEditorComponent,
    ],
    imports: [BrowserModule, CoreModule, FormsModule, ReactiveFormsModule]
})
export class EditorCommonModule {

}
