import {Component, Input, OnInit} from "@angular/core";
import {AppValidityState} from "../app-validator/app-validator.service";

@Component({
    selector: "ct-report-panel",
    template: `
        <ct-app-execution-preview *ngIf="active === 'execution'"
                                  [content]="executionOutput"></ct-app-execution-preview>

        <ct-validation-report *ngIf="active === 'validation'"
                              [errors]="validation.errors"
                              [warnings]="validation.warnings"></ct-validation-report>

        <ct-command-line-preview *ngIf="active === 'commandLinePreview'"
                                 [commandLineParts]="commandLineParts"></ct-command-line-preview>
    `,
})
export class ReportPanelComponent implements OnInit {


    @Input()
    active: "execution" | "validation" | "commandLinePreview";

    @Input()
    validation: AppValidityState;

    @Input()
    commandLineParts: { type: string, value: string }[] = [];

    constructor() {
    }

    ngOnInit() {
    }

}
