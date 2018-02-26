import {Component, Input, Output, ViewEncapsulation} from "@angular/core";
import {Subject} from "rxjs/Subject";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-modal-checkbox-prompt",
    template: `
        <form (ngSubmit)="decision.next(answer.checked)">
            <div class="modal-body">
                <span [innerHTML]="content"></span>
                <div class="form-group">
                    <div class="form-check">
                        <label class="form-check-label">
                            <input type="checkbox" #answer class="form-check-input"/>
                            {{ checkboxLabel }}
                        </label>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary btn-sm" (click)="decision.next(null)" type="button">
                    {{ cancellationLabel }}
                </button>
                <button class="btn btn-primary btn-sm" type="submit">{{ confirmationLabel }}</button>
            </div>
        </form>
    `
})
export class CheckboxPromptComponent {

    @Input()
    content: string;

    @Input()
    cancellationLabel: string;

    @Input()
    confirmationLabel: string;

    @Input()
    checkboxLabel: string;

    @Output()
    decision = new Subject<boolean>();

    constructor() {

        this.content = "Are you sure?";
        this.cancellationLabel = "Cancel";
        this.confirmationLabel = "Yes";
        this.checkboxLabel = "Don't show this again";
    }
}
