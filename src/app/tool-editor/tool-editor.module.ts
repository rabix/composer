import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {CoreModule} from "../core/core.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {ArgumentListComponent} from "./sections/arguments/argument-list.component";
import {FileDefListComponent} from "./sections/file-def-list/file-def-list.component";
import {BasicInputSectionComponent} from "./object-inspector/basic-section/basic-input-section.component";
import {InputTypeSelectComponent} from "./common/type-select/type-select.component";
import {ReactiveFormsModule, FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        ArgumentListComponent,
        FileDefListComponent,
        BasicInputSectionComponent,
        InputTypeSelectComponent,
    ],
    exports: [
        ArgumentListComponent,
        FileDefListComponent,
        BasicInputSectionComponent
    ],
    imports: [
        BrowserModule,
        EditorCommonModule,
        CoreModule,
        FormsModule,
        ReactiveFormsModule,
    ]
})
export class ToolEditorModule {

}
