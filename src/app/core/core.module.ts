import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormPanelComponent} from "./elements/form-panel.component";
import {IpcService} from "../services/ipc.service";
import {GuidService} from "../services/guid.service";

@NgModule({
    declarations: [
        FormPanelComponent,
    ],
    exports: [
        FormPanelComponent,
    ],
    providers: [
        IpcService,
        GuidService
    ],
    imports: [BrowserModule]
})
export class CoreModule {

}