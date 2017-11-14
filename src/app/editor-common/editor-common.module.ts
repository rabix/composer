import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {CWLModule} from "../cwl/cwl.module";
import {UIModule} from "../ui/ui.module";
import {AppExecutionContextModalComponent} from "./app-execution-context-modal/app-execution-context-modal.component";
import {AppExecutionPreviewComponent} from "./app-execution-panel/app-execution-preview.component";
import {AppValidatorService} from "./app-validator/app-validator.service";
import {AppInfoComponent} from "./components/app-info/app-info.component";
import {CompactListComponent} from "./components/compact-list/compact-list.component";
import {ExpressionInputComponent} from "./components/expression-input/expression-input.component";
import {ExpressionModelListComponent} from "./components/expression-model-list/expression-model-list.component";
import {HintsComponent} from "./components/hint-list/hint-list.component";
import {RequirementInputComponent} from "./components/hint-list/requirement-input.component";
import {KeyValueInputComponent} from "./components/key-value-component/key-value-input.component";
import {KeyValueListComponent} from "./components/key-value-component/key-value-list.component";
import {MapListComponent} from "./components/map-list/map-list.component";
import {QuickPickComponent} from "./components/quick-pick/quick-pick.component";
import {RevisionListComponent} from "./components/revision-list/revision-list.component";
import {SymbolsComponent} from "./components/symbols/symbols.component";
import {InputTypeSelectComponent} from "./components/type-select/type-select.component";
import {ValidationClassDirective} from "./components/validation-preview/validation-class.directive";
import {ValidationPreviewComponent} from "./components/validation-preview/validation-preview.component";
import {ValidationReportComponent} from "./components/validation-report/validation-report.component";
import {CwlSchemaValidationWorkerService} from "./cwl-schema-validation-worker/cwl-schema-validation-worker.service";
import {EditableDirective} from "./directives/editable.directive";
import {EditorLayoutComponent} from "./editor-layout/editor-layout.component";
import {ExpressionEditorComponent} from "./expression-editor/expression-editor.component";
import {ModelExpressionEditorComponent} from "./expression-editor/model-expression-editor.component";
import {DirectoryInputInspectorComponent} from "./inspector-forms/directory-input-inspector/directory-input-inspector.component";
import {FileInputInspectorComponent} from "./inspector-forms/file-input-inspector.component";
import {EditorInspectorContentComponent} from "./inspector/editor-inspector-content.component";
import {EditorInspectorComponent} from "./inspector/editor-inspector.component";
import {EditorInspectorDirective} from "./inspector/editor-inspector.directive";
import {JobEditorEntryComponent} from "./job-editor/job-editor-entry.component";
import {JobEditorComponent} from "./job-editor/job-editor.component";
import {EditorPanelComponent} from "./layout/editor-panel/editor-panel.component";
import {FileDefContentPipe} from "./pipes/file-def-content.pipe";
import {FileDefNamePipe} from "./pipes/file-def-name.pipe";
import {ValidationTextPipe} from "./pipes/validation-text.pipes";
import {CommonDocumentControlsComponent} from "./template-common/common-document-controls/common-document-controls.component";
import {CommonReportPanelComponent} from "./template-common/common-preview-panel/common-report-panel.component";
import {CommonStatusControlsComponent} from "./template-common/common-status-controls/common-status-controls.component";

@NgModule({
    declarations: [
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
        ValidationPreviewComponent,
        ValidationReportComponent,
        ValidationTextPipe,
        FileInputInspectorComponent,
        MapListComponent,
        SymbolsComponent,
        InputTypeSelectComponent,
        AppInfoComponent,
        EditorLayoutComponent,
        EditorPanelComponent,
        HintsComponent,
        DirectoryInputInspectorComponent,
        RequirementInputComponent,
        AppExecutionPreviewComponent,
        AppExecutionContextModalComponent,
        CommonDocumentControlsComponent,
        CommonStatusControlsComponent,
        CommonReportPanelComponent,
    ],
    exports: [
        MapListComponent,
        CompactListComponent,
        FileInputInspectorComponent,
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
        ValidationPreviewComponent,
        ValidationReportComponent,
        SymbolsComponent,
        InputTypeSelectComponent,
        AppInfoComponent,
        EditorLayoutComponent,
        HintsComponent,
        RequirementInputComponent,
        AppExecutionPreviewComponent,
        CommonDocumentControlsComponent,
        CommonStatusControlsComponent,
        CommonReportPanelComponent
    ],
    entryComponents: [
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        ExpressionEditorComponent,
        ModelExpressionEditorComponent,
        AppExecutionContextModalComponent
    ],
    providers: [
        CwlSchemaValidationWorkerService,
        AppValidatorService,
    ],
    imports: [
        BrowserModule,
        CWLModule,
        FormsModule,
        ReactiveFormsModule,
        UIModule,
    ]
})
export class EditorCommonModule {

}
