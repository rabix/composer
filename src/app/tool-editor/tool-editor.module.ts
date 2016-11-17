import {NgModule} from "@angular/core";
import {EditorCommonModule} from "../editor-common/editor-common.module";
import {BrowserModule} from "@angular/platform-browser";
import {ArgumentListComponent} from "./sections/arguments/argument-list.component";
import {CoreModule} from "../core/core.module";


@NgModule({
    declarations: [
        ArgumentListComponent
    ],
    exports: [
        ArgumentListComponent
    ],
    imports: [
        BrowserModule,
        EditorCommonModule,
        CoreModule
    ]
})
export class ToolEditorModule {

}