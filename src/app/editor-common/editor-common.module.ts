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
import {ExpressionModelListComponent} from "./components/expression-model-list/expression-model-list.componen";
import {ValidationComponent} from "./components/validation-preview/validation-preview.component";
import {ValidationTextPipe} from "./pipes/validation-text.pipes";
import {ValidationClassDirective} from "./components/validation-preview/validation-class.directive";

@NgModule({
    declarations: [
        BlankToolStateComponent,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        ExpressionEditorComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        ValidationTextPipe,
        EditorInspectorDirective,
        ExpressionInputComponent,
        QuickPickComponent,
        ToggleComponent,
        ValidationComponent,
        ValidationClassDirective,
        ModelExpressionEditorComponent,
        CompactListComponent,
        EditableDirective,
        ExpressionModelListComponent
    ],
    exports: [
        BlankToolStateComponent,
        ExpressionEditorComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        ToggleComponent,
        ModelExpressionEditorComponent,
        EditorInspectorDirective,
        EditorInspectorComponent,
        ExpressionInputComponent,
        EditorInspectorContentComponent,
        QuickPickComponent,
        CompactListComponent,
        EditableDirective,
        ExpressionModelListComponent,
        QuickPickComponent,
        ValidationComponent,
        ValidationClassDirective
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
