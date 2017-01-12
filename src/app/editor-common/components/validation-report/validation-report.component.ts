import {Component, Input, ChangeDetectionStrategy} from "@angular/core";
import {ValidationResponse} from "../../../services/web-worker/json-schema/json-schema.service";

require("./validation-report.component.scss");
@Component({
    selector: "ct-validation-report",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p class="error-text" *ngFor="let error of issues.errors">
            {{ error.loc ? error.loc + ": " : ""}}
            {{ error.message }}
        </p>
        
        <p class="warning-text" *ngFor="let warning of issues.warnings">
            {{ warning.loc ? warning.loc + ": " : ""}}
            {{ warning.message }}
        </p>
`
})
export class ValidationReportComponent {
    @Input()
    public issues: ValidationResponse;
}
