import {Component, Input, OnChanges, ViewEncapsulation} from "@angular/core";
import {Validation, ValidationBase} from "cwlts/models/helpers/validation";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "ct-validation-preview",
    styleUrls: ["./validation-preview.component.scss"],
    template: `
        <i class="fa fa-times-circle validation-icon"
           *ngIf="entry.hasErrors"
           [ct-tooltip]="errorsTooltip"></i>

        <ct-tooltip-content #errorsTooltip>
            <p class="text-console-error px-1" *ngFor="let error of entry?.errors">
                {{error.loc}}: {{ error.message }}</p>
        </ct-tooltip-content>

        <i class="fa fa-warning validation-icon"
           [ct-tooltip]="warningsTooltip"
           *ngIf="!entry.hasErrors && entry.hasWarnings"></i>

        <ct-tooltip-content #warningsTooltip>
            <p class="warning-text px-1" *ngFor="let warning of entry?.warnings">
                {{warning.loc}}: {{ warning.message }}</p>
        </ct-tooltip-content>
    `
})
export class ValidationPreviewComponent {
    @Input()
    public entry: ValidationBase;
}
