import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CoreModule} from "../core/core.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {ArgumentListComponent} from "./sections/arguments/argument-list.component";
import {FileDefListComponent} from "./sections/file-def-list/file-def-list.component";
import {ResourcesComponent} from "./sections/resources/resources.component";
import {ToolInputListComponent} from "./sections/inputs/tool-input-list.component";
import {ToolOutputListComponent} from "./sections/outputs/tool-output-list.component";

import {CWLModule} from "../cwl/cwl.module";
import {ToolInputInspector} from "./sections/inputs/tool-input-inspector.component";
import {ToolOutputInspector} from "./sections/outputs/tool-output-inspector.component";
import {ArgumentInspector} from "./sections/arguments/argument-inspector.component";

import {BasicInputSectionComponent} from "./object-inspector/basic-section/basic-input-section.component";
import {BasicOutputSectionComponent} from "./object-inspector/basic-section/basic-output-section.component";
import {InputTypeSelectComponent} from "./common/type-select/type-select.component";
import {InputDescriptionComponent} from "./object-inspector/input-description/input-description.component";
import {OutputDescriptionComponent} from "./object-inspector/output-description/output-description.component";
import {InputBindingSectionComponent} from "./object-inspector/input-binding/input-binding-section.component";
import {SymbolsComponent} from "./object-inspector/sybols-component/symbols.component";
import {SecondaryFilesComponent} from "./object-inspector/secondary-files/secondary-files.component";
import {OutputMetaDataSectionComponent} from "./object-inspector/output-metadata-section/output-metadata.component";
import {StageInputSectionComponent} from "./object-inspector/stage-input-section/stage-input-section.component";
import {OutputEvalSectionComponent} from "./object-inspector/output-eval-section/output-eval.component";
import {CompactListComponent} from "../components/compact-list/compact-list.component";
import {EditableDirective} from "../directives/editable.directive";



@NgModule({
    declarations: [
        ArgumentListComponent,
        ArgumentInspector,
        FileDefListComponent,
        ToolInputListComponent,
        ToolInputInspector,
        ToolOutputListComponent,
        ToolOutputInspector,
        BasicInputSectionComponent,
        BasicOutputSectionComponent,
        InputTypeSelectComponent,
        InputDescriptionComponent,
        OutputDescriptionComponent,
        InputBindingSectionComponent,
        SymbolsComponent,
        SecondaryFilesComponent,
        OutputMetaDataSectionComponent,
        StageInputSectionComponent,
        OutputEvalSectionComponent,
        ResourcesComponent,
        CompactListComponent,
        EditableDirective
    ],
    exports: [
        ArgumentListComponent,
        ArgumentInspector,
        FileDefListComponent,
        ResourcesComponent,
        ToolInputListComponent,
        ToolInputInspector,
        ToolOutputListComponent,
        ToolOutputInspector,
        BasicInputSectionComponent,
        BasicOutputSectionComponent,
        InputDescriptionComponent,
        OutputDescriptionComponent,
        StageInputSectionComponent,
        OutputEvalSectionComponent,
        OutputMetaDataSectionComponent,
        CompactListComponent,
        EditableDirective
    ],
    imports: [
        BrowserModule,
        CoreModule,
        CWLModule,
        EditorCommonModule,
        FormsModule,
        ReactiveFormsModule,
    ]
})
export class ToolEditorModule {

}
