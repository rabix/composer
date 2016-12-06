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

@NgModule({
    declarations: [
        BlankToolStateComponent,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        ExpressionEditorComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        EditorInspectorDirective,
        ExpressionInputComponent,
        QuickPickComponent,
        ToggleComponent,
        ExpressionInputComponent
        ModelExpressionEditorComponent,
    ],
    exports: [
        BlankToolStateComponent,
        ExpressionEditorComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        ToggleComponent,
        ExpressionInputComponent
        ModelExpressionEditorComponent,
        EditorInspectorDirective,
        EditorInspectorComponent,
        ExpressionInputComponent,
        EditorInspectorContentComponent,
        QuickPickComponent

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
