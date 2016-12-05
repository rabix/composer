import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {BlankToolStateComponent} from "./components/blank-tool-state.component";
import {EditorInspectorComponent} from "./inspector/editor-inspector.component";
import {EditorInspectorContentComponent} from "./inspector/editor-inspector-content.component";
import {EditorInspectorDirective} from "./inspector/editor-inspector.directive";
import {ExpressionEditorComponent} from "./expression-editor/expression-editor.component";
import {FileDefContentPipe} from "./pipes/file-def-content.pipe";
import {FileDefNamePipe} from "./pipes/file-def-name.pipe";
import {CoreModule} from "../core/core.module";
import {ModelExpressionEditorComponent} from "./expression-editor/model-expression-editor.component";

@NgModule({
    declarations: [
        BlankToolStateComponent,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        EditorInspectorDirective,
        ExpressionEditorComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        ModelExpressionEditorComponent,
    ],
    exports: [
        BlankToolStateComponent,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        EditorInspectorDirective,
        ExpressionEditorComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        ModelExpressionEditorComponent,
    ],
    entryComponents: [
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        ExpressionEditorComponent,
        ModelExpressionEditorComponent,
    ],
    imports: [CoreModule, BrowserModule]
})
export class EditorCommonModule {

}