import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {CoreModule} from "../core/core.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {ArgumentListComponent} from "./sections/arguments/argument-list.component";
import {FileDefListComponent} from "./sections/file-def-list/file-def-list.component";
import {BasicInputSectionComponent} from "./object-inspector/basic-section/basic-input-section.component";
import {InputTypeSelectComponent} from "./common/type-select/type-select.component";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";
import {InputDescriptionComponent} from "./object-inspector/input-description/input-description.component";
import {InputBindingSectionComponent} from "./object-inspector/input-binding/input-binding-section.component";
import {SymbolsComponent} from "./object-inspector/sybols-component/symbols.component";

@NgModule({
    declarations: [
        ArgumentListComponent,
        FileDefListComponent,
        BasicInputSectionComponent,
        InputTypeSelectComponent,
        InputDescriptionComponent,
        InputBindingSectionComponent,
        SymbolsComponent
    ],
    exports: [
        ArgumentListComponent,
        FileDefListComponent,
        BasicInputSectionComponent,
        InputDescriptionComponent,
    ],
    imports: [
        BrowserModule,
        EditorCommonModule,
        CoreModule,
        FormsModule,
        ReactiveFormsModule
    ]
})
export class ToolEditorModule {

}
