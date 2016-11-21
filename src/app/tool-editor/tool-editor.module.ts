import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {CoreModule} from "../core/core.module";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {ArgumentListComponent} from "./sections/arguments/argument-list.component";
import {FileDefListComponent} from "./sections/file-def-list/file-def-list.component";


@NgModule({
    declarations: [
        ArgumentListComponent,
        FileDefListComponent,
    ],
    exports: [
        ArgumentListComponent,
        FileDefListComponent,
    ],
    imports: [
        BrowserModule,
        EditorCommonModule,
        CoreModule
    ]
})
export class ToolEditorModule {

}