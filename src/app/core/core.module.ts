import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {FormPanelComponent} from "./elements/form-panel.component";

@NgModule({
    declarations: [
        FormPanelComponent,
    ],
    exports: [
        FormPanelComponent,
    ],
    imports: [BrowserModule]
})
export class CoreModule {

}