import {Component, Input, OnChanges, ViewEncapsulation} from "@angular/core";
import {Validation, ValidationBase} from "cwlts/models/helpers/validation";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-validation-preview",
    styleUrls: ["./validation-preview.component.scss"],
    template: `
        <i class="fa fa-times-circle validation-icon"
           *ngIf="icon === 'error'"
           [ct-tooltip]="errorsTooltip"></i>

        <ct-tooltip-content #errorsTooltip>
            <p class="text-console-error px-1" *ngFor="let error of errors">
                {{ error.message }}</p>
        </ct-tooltip-content>

        <i class="fa fa-warning validation-icon"
           [ct-tooltip]="warningsTooltip"
           *ngIf="icon === 'warning'"></i>

        <ct-tooltip-content #warningsTooltip>
            <p class="warning-text px-1" *ngFor="let warning of warnings">
                {{ warning.message }}</p>
        </ct-tooltip-content>
    `
})
export class ValidationComponent implements OnChanges {
    @Input()
    public entry: ValidationBase;

    errors: any[]   = [];
    warnings: any[] = [];

    icon: "error" | "warning" | null = null;

    ngOnChanges() {
        if (this.entry && this.entry instanceof ValidationBase) {
            this.errors   = this.entry.filterIssues("error") || [];
            this.warnings = this.entry.filterIssues("warning") || [];

            if (this.errors.length > 0) {
                this.icon = "error";
            } else if (this.warnings.length > 0) {
                this.icon = "warning";
            } else {
                this.icon = null;
            }
        }

        if (!(this.entry instanceof ValidationBase)) {
            console.log(this.entry);
        }
    }
}
