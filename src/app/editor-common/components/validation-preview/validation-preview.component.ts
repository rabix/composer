import {Component, Input, OnInit} from "@angular/core";
import {Validation} from "cwlts/models/helpers/validation";

require("./validation-preview.component.scss");

@Component({
    selector: "ct-validation-preview",
    template: `
    <i class="fa fa-times-circle validation-icon"
       *ngIf="entry?.errors.length"
       [ct-tooltip]="errors"></i>

    <i class="fa fa-warning validation-icon"
       [ct-tooltip]="warnings"
       *ngIf="entry?.warnings.length && !entry.errors.length"></i> 
                
    <ct-tooltip-content #warnings>
        <div class="warning-text px-1" *ngFor="let warning of entry.warnings">{{ warning.message }}</div>
    </ct-tooltip-content>
    
    <ct-tooltip-content #errors>
        <div class="text-console-error px-1" *ngFor="let error of entry.errors">{{ error.message }}</div>
    </ct-tooltip-content>
`
})
export class ValidationComponent {
    @Input()
    public entry: Validation;
}