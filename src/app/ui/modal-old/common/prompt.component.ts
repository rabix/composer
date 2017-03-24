/* import {Component, Input, Output, ViewEncapsulation} from "@angular/core";
import {Subject} from "rxjs";
import {FormControl, FormGroup} from "@angular/forms";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-modal-prompt",
    template: `
        <form (ngSubmit)="decision.next(answer.value)" [formGroup]="form">
            <div class="modal-body">
                <div class="form-group">
                    <label [innerHTML]="content"></label>
                    <input #answer autofocus [formControl]="formControl" class="form-control"/>
                </div>
            </div>
            <div *ngIf="errors.length > 0" class="m-1 alert alert-warning">
                <div *ngFor="let err of errors">{{ err }}</div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary btn-sm" (click)="decision.next(false)" type="button">{{ cancellationLabel }}</button>
                <button [disabled]="form.invalid" class="btn btn-primary btn-sm" type="submit">{{ confirmationLabel }}</button>
            </div>
        </form>
    `
})
export class PromptComponent extends DirectiveBase {

    @Input()
    public content: string;

    @Input()
    public cancellationLabel: string;

    @Input()
    public confirmationLabel: string;

    @Output()
    public decision = new Subject<boolean>();

    @Input()
    public formControl: FormControl;

    private form: FormGroup;

    private errors: string[] = [];


    constructor() {

        super();
        this.content = "Are you sure?";
        this.cancellationLabel = "Cancel";
        this.confirmationLabel = "Yes";

        this.form = new FormGroup({});
    }

    ngOnInit() {
        this.form.addControl("formControl", this.formControl);
    }

    ngAfterViewInit() {
        this.tracked = this.formControl.statusChanges.subscribe(_ => {
            this.errors = Object.keys(this.formControl.errors || {}).map(key => this.formControl.errors[key]);
        });
    }
}
*/

