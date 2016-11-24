import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {BlankToolStateComponent} from "./components/blank-tool-state.component";
import {FileDefContentPipe} from "./pipes/file-def-content.pipe";
import {FileDefNamePipe} from "./pipes/file-def-name.pipe";
import {ToggleComponent} from "./components/toggle-slider/toggle-slider.component";
import {ExpressionInputComponent} from "./components/expression-input/expression-input.component";

@NgModule({
    declarations: [
        BlankToolStateComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        ToggleComponent,
        ExpressionInputComponent
    ],
    exports: [
        BlankToolStateComponent,
        FileDefContentPipe,
        FileDefNamePipe,
        ToggleComponent,
        ExpressionInputComponent
    ],
    imports: [BrowserModule]
})
export class EditorCommonModule {

}
