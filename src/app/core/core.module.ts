import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormPanelComponent} from "./elements/form-panel.component";
import {TooltipDirective} from "./ui/tooltip/tooltip.directive";
import {TooltipContentComponent} from "./ui/tooltip/tooltip-content.component";
import {CodeEditorComponent} from "./ui/code-editor/code-editor.component";
import {IpcService} from "../services/ipc.service";
import {GuidService} from "../services/guid.service";
import {CodePreviewComponent} from "./ui/code-editor/code-preview.component";

@NgModule({
    entryComponents: [
        TooltipContentComponent,
    ],
    declarations: [
        // Components
        CodeEditorComponent,
        CodePreviewComponent,
        FormPanelComponent,
        TooltipContentComponent,

        // Directives
        TooltipDirective
    ],
    exports: [
        // Components
        CodeEditorComponent,
        CodePreviewComponent,
        FormPanelComponent,
        TooltipContentComponent,

        // Directives
        TooltipDirective

    ],
    providers: [

    ],
    imports: [BrowserModule]
})
export class CoreModule {

}
