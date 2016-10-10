import {NgModule} from "@angular/core";
import {HttpModule} from "@angular/http";
import {MainComponent} from "./app/components/main/main.component";
import {BrowserModule} from "@angular/platform-browser";
import {FormsModule, FormBuilder} from "@angular/forms";

@NgModule({
    providers: [FormBuilder],

    declarations: [MainComponent],
    imports: [BrowserModule, FormsModule, HttpModule],
    bootstrap: [MainComponent]
})
export class AppModule {
}