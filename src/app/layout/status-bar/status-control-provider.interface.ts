import {TemplateRef} from "@angular/core";

export interface StatusControlProvider {
    provideStatusControls(): TemplateRef<any>;
}
