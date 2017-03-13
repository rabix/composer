import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {CWLModule} from "../cwl/cwl.module";
import {BlankToolStateComponent} from "./components/blank-tool-state.component";
import {EditorInspectorComponent} from "./inspector/editor-inspector.component";
import {EditorInspectorContentComponent} from "./inspector/editor-inspector-content.component";
import {EditorInspectorDirective} from "./inspector/editor-inspector.directive";
import {QuickPickComponent} from "./components/quick-pick/quick-pick.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ExpressionEditorComponent} from "./expression-editor/expression-editor.component";
import {FileDefContentPipe} from "./pipes/file-def-content.pipe";
import {FileDefNamePipe} from "./pipes/file-def-name.pipe";
import {ExpressionInputComponent} from "./components/expression-input/expression-input.component";
import {ModelExpressionEditorComponent} from "./expression-editor/model-expression-editor.component";
import {CompactListComponent} from "./components/compact-list/compact-list.component";
import {EditableDirective} from "./directives/editable.directive";
import {ExpressionModelListComponent} from "./components/expression-model-list/expression-model-list.component";
import {ValidationComponent} from "./components/validation-preview/validation-preview.component";
import {ValidationTextPipe} from "./pipes/validation-text.pipes";
import {ValidationClassDirective} from "./components/validation-preview/validation-class.directive";
import {RevisionListComponent} from "./components/revision-list/revision-list.component";
import {KeyValueInputComponent} from "./components/key-value-component/key-value-input.component";
import {KeyValueListComponent} from "./components/key-value-component/key-value-list.component";
import {ValidationReportComponent} from "./components/validation-report/validation-report.component";
import {JobEditorComponent} from "./job-editor/job-editor.component";
import {FileInputInspector} from "./inspector-forms/file-input-inspector.component";
import {JobEditorEntryComponent} from "./job-editor/job-editor-entry.component";
import {MapListComponent} from "./components/map-list/map-list.component";
import {CwlSchemaValidationWorkerService} from "./cwl-schema-validation-worker/cwl-schema-validation-worker.service";
import {SymbolsComponent} from "./components/symbols/symbols.component";
import {InputTypeSelectComponent} from "./components/type-select/type-select.component"
import {AppInfoComponent} from "./components/app-info/app-info.component";
import {InputTypeSelectComponent} from "./components/type-select/type-select.component";
import {UIModule} from "../ui/ui.module";

@NgModule({
    declarations: [
        BlankToolStateComponent,
        CompactListComponent,
        EditableDirective,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        EditorInspectorDirective,
        ExpressionEditorComponent,
        ExpressionInputComponent,
        ExpressionModelListComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        JobEditorComponent,
        JobEditorEntryComponent,
        KeyValueInputComponent,
        KeyValueListComponent,
        ModelExpressionEditorComponent,
        QuickPickComponent,
        RevisionListComponent,
        ValidationClassDirective,
        ValidationComponent,
        ValidationReportComponent,
        ValidationTextPipe,
        FileInputInspector,
        MapListComponent,
        SymbolsComponent,
        InputTypeSelectComponent,
        AppInfoComponent
    ],
    exports: [
        MapListComponent,
        BlankToolStateComponent,
        CompactListComponent,
        FileInputInspector,
        EditableDirective,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        EditorInspectorDirective,
        ExpressionEditorComponent,
        ExpressionInputComponent,
        ExpressionModelListComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        JobEditorComponent,
        KeyValueInputComponent,
        KeyValueListComponent,
        ModelExpressionEditorComponent,
        QuickPickComponent,
        RevisionListComponent,
        ValidationClassDirective,
        ValidationComponent,
        ValidationReportComponent,
        SymbolsComponent,
        InputTypeSelectComponent,
        AppInfoComponent
    ],
    entryComponents: [
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        ExpressionEditorComponent,
        ModelExpressionEditorComponent,
    ],
    providers: [
        CwlSchemaValidationWorkerService
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        UIModule,
    ]
})
export class EditorCommonModule {

}
