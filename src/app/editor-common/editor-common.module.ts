import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {BlankToolStateComponent} from "./components/blank-tool-state.component";
import {FileDefContentPipe} from "./pipes/file-def-content.pipe";
import {FileDefNamePipe} from "./pipes/file-def-name.pipe";

@NgModule({
    declarations: [
        BlankToolStateComponent,
        FileDefContentPipe,
        FileDefNamePipe,
    ],
    exports: [
        BlankToolStateComponent,
        FileDefContentPipe,
        FileDefNamePipe,
    ],
    imports: [BrowserModule]
})
export class EditorCommonModule {

}