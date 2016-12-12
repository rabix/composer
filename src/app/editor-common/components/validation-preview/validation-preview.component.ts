import {Component, Input, OnInit} from "@angular/core";
import {Validation} from "cwlts/models/helpers/validation";

require("./validation-preview.component.scss");

@Component({
    selector: "ct-validation-preview",
    template: `
    <i class="fa fa-times-circle validation-icon"
       *ngIf="entry?.errors.length"
       [ct-tooltip]="entry?.errors | validationText"></i>

    <i class="fa fa-warning validation-icon"
       [ct-tooltip]="entry?.warnings | validationText"
       *ngIf="entry?.warnings.length && !entry.errors.length"></i>          
`
})
export class ValidationComponent {
    @Input()
    public entry: Validation;
}