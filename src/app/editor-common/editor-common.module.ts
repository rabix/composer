import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {BlankToolStateComponent} from "./components/blank-tool-state.component";
import {FileDefContentPipe} from "./pipes/file-def-content.pipe";
import {FileDefNamePipe} from "./pipes/file-def-name.pipe";
import {EditorInspectorComponent} from "./inspector/editor-inspector.component";
import {EditorInspectorContentComponent} from "./inspector/editor-inspector-content.component";
import {EditorInspectorDirective} from "./inspector/editor-inspector.directive";

@NgModule({
    declarations: [
        BlankToolStateComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        EditorInspectorDirective,
        EditorInspectorComponent,
        EditorInspectorContentComponent
    ],
    exports: [
        BlankToolStateComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        EditorInspectorDirective,
        EditorInspectorComponent,
        EditorInspectorContentComponent
    ],
    entryComponents: [
        EditorInspectorComponent,
        EditorInspectorContentComponent,
    ],
    imports: [BrowserModule]
})
export class EditorCommonModule {

}