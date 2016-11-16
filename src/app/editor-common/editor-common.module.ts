import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {BlankToolStateComponent} from "./components/blank-tool-state.component";

@NgModule({
    declarations: [
        BlankToolStateComponent,
    ],
    exports: [
        BlankToolStateComponent,
    ],
    imports: [BrowserModule]
})
export class EditorCommonModule {

}