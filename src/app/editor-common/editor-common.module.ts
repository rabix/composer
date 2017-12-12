import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {CWLModule} from "../cwl/cwl.module";
import {UIModule} from "../ui/ui.module";
import {AppExecutionContextModalComponent} from "./app-execution-context-modal/app-execution-context-modal.component";
import {AppExecutionPreviewComponent} from "./app-execution-panel/app-execution-preview.component";
import {AppExportModalComponent} from "./app-export-modal/app-export-modal.component";
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
import {GraphJobEditorComponent} from "./graph-job-editor/graph-job-editor.component";
import {JobFileMetadataModalComponent} from "./graph-job-editor/job-file-metadata-modal/job-file-metadata-modal.component";
import {JobStepInspectorEntryComponent} from "./graph-job-editor/job-step-inspector-entry/job-step-inspector-entry.component";
import {JobStepInspectorComponent} from "./graph-job-editor/job-step-inspector/job-step-inspector.component";
import {DirectoryInputInspectorComponent} from "./inspector-forms/directory-input-inspector/directory-input-inspector.component";
import {FileInputInspectorComponent} from "./inspector-forms/file-input-inspector.component";
import {EditorInspectorContentComponent} from "./inspector/editor-inspector-content.component";
import {EditorInspectorComponent} from "./inspector/editor-inspector.component";
import {EditorInspectorDirective} from "./inspector/editor-inspector.directive";
import {JobImportExportComponent} from "./job-import-export/job-import-export.component";
import {EditorPanelComponent} from "./layout/editor-panel/editor-panel.component";
import {FileDefContentPipe} from "./pipes/file-def-content.pipe";
import {FileDefNamePipe} from "./pipes/file-def-name.pipe";
import {ValidationTextPipe} from "./pipes/validation-text.pipes";
import {CommonDocumentControlsComponent} from "./template-common/common-document-controls/common-document-controls.component";
import {CommonReportPanelComponent} from "./template-common/common-preview-panel/common-report-panel.component";
import {CommonStatusControlsComponent} from "./template-common/common-status-controls/common-status-controls.component";

@NgModule({
    declarations: [
        AppExecutionContextModalComponent,
        AppExecutionPreviewComponent,
        AppInfoComponent,
        CommonDocumentControlsComponent,
        CommonReportPanelComponent,
        CommonStatusControlsComponent,
        CompactListComponent,
        DirectoryInputInspectorComponent,
        EditableDirective,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        EditorInspectorDirective,
        EditorLayoutComponent,
        EditorPanelComponent,
        ExpressionEditorComponent,
        ExpressionInputComponent,
        ExpressionModelListComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        FileInputInspectorComponent,
        GraphJobEditorComponent,
        HintsComponent,
        InputTypeSelectComponent,
        JobFileMetadataModalComponent,
        JobImportExportComponent,
        JobStepInspectorComponent,
        JobStepInspectorEntryComponent,
        KeyValueInputComponent,
        KeyValueListComponent,
        MapListComponent,
        ModelExpressionEditorComponent,
        QuickPickComponent,
        RequirementInputComponent,
        RevisionListComponent,
        SymbolsComponent,
        ValidationClassDirective,
        ValidationPreviewComponent,
        ValidationReportComponent,
        ValidationTextPipe,
        JobStepInspectorComponent,
        JobImportExportComponent,
        AppExportModalComponent

    ],
    exports: [
        AppExecutionPreviewComponent,
        AppInfoComponent,
        CommonDocumentControlsComponent,
        CommonReportPanelComponent,
        CommonStatusControlsComponent,
        CompactListComponent,
        EditableDirective,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        EditorInspectorDirective,
        EditorLayoutComponent,
        ExpressionEditorComponent,
        ExpressionInputComponent,
        ExpressionModelListComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        FileInputInspectorComponent,
        GraphJobEditorComponent,
        HintsComponent,
        InputTypeSelectComponent,
        JobStepInspectorComponent,
        JobStepInspectorEntryComponent,
        KeyValueInputComponent,
        KeyValueListComponent,
        MapListComponent,
        MapListComponent,
        ModelExpressionEditorComponent,
        QuickPickComponent,
        RequirementInputComponent,
        RevisionListComponent,
        SymbolsComponent,
        ValidationClassDirective,
        ValidationPreviewComponent,
        ValidationReportComponent,
    ],
    entryComponents: [
        AppExecutionContextModalComponent,
        AppExportModalComponent,
        EditorInspectorComponent,
        EditorInspectorContentComponent,
        ExpressionEditorComponent,
        JobFileMetadataModalComponent,
        JobImportExportComponent,
        ModelExpressionEditorComponent,
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
