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
import {BasicInputSectionComponent} from "./object-inspector/input-inspector/basic-section/basic-input-section.component";
import {BasicOutputSectionComponent} from "./object-inspector/output-inspector/output-basic-section/basic-output-section.component";
import {InputTypeSelectComponent} from "./common/type-select/type-select.component";
import {DescriptionComponent} from "./object-inspector/common-sections/description-section/description.component";
import {InputBindingSectionComponent} from "./object-inspector/input-inspector/input-binding/input-binding-section.component";
import {SymbolsComponent} from "./object-inspector/common-sections/symbols-section/symbols.component";
import {OutputMetaDataSectionComponent} from "./object-inspector/output-inspector/output-metadata-section/output-metadata.component";
import {StageInputSectionComponent} from "./object-inspector/input-inspector/stage-input-section/stage-input-section.component";
import {OutputEvalSectionComponent} from "./object-inspector/output-inspector/output-eval-section/output-eval.component";
//import {SecondaryFilesComponent} from "./object-inspector/common-sections/secondary-files-sections/secondary-files.component";
import {SecondaryFilesComponent} from "./object-inspector/secondary-files/secondary-files.component";

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
        DescriptionComponent,
        InputBindingSectionComponent,
        SymbolsComponent,
        SecondaryFilesComponent,
        OutputMetaDataSectionComponent,
        StageInputSectionComponent,
        ResourcesComponent,
        OutputEvalSectionComponent,
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
        DescriptionComponent,
        StageInputSectionComponent,
        OutputEvalSectionComponent,
        OutputMetaDataSectionComponent
    ],
    imports: [
        BrowserModule,
        CoreModule,
        CWLModule,
        EditorCommonModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class ToolEditorModule {

}
