import {ChangeDetectionStrategy, Component, Input} from "@angular/core";

@Component({
    selector: "ct-validation-report",
    styleUrls: ["./validation-report.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <p *ngIf="!errors.length && !warnings.length">
            No issues found.
        </p>

        <p class="text-console-error" *ngFor="let error of errors">
            {{ error.loc ? error.loc + ": " : ""}}
            {{ error.message }}
        </p>

        <p class="text-console-warning" *ngFor="let warning of warnings">
            {{ warning.loc ? warning.loc + ": " : ""}}
            {{ warning.message }}
        </p>
    `
})
export class ValidationReportComponent {
    @Input()
    errors: { message: string; loc: string }[]   = [];

    @Input()
    warnings: { message: string; loc: string }[] = [];
}
