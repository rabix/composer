import {NgModule} from "@angular/core";
import {MainComponent} from "./app/components/main/main.component";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, FormBuilder} from "@angular/forms";

@NgModule({
    providers: [FormBuilder],

    declarations: [MainComponent],
    imports: [BrowserModule, FormsModule],
    bootstrap: [MainComponent]
})
export class AppModule {
}
