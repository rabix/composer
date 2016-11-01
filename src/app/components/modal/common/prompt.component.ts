import {Component, Input, Output} from "@angular/core";
import {Subject} from "rxjs";
import {assignable} from "../../../decorators/index";
import {FormControl, FormGroup} from "@angular/forms";
import {ComponentBase} from "../../common/component-base";

@Component({
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
                <button [disabled]="form.invalid" class="btn btn-primary btn-sm" type="submit" >{{ confirmationLabel }}</button>
            </div>
        </form>
    `
})
export class PromptComponent extends ComponentBase {

    @assignable()
    @Input()
    public content: string;

    @assignable()
    @Input()
    public cancellationLabel: string;

    @assignable()
    @Input()
    public confirmationLabel: string;

    @assignable("next")
    @Output()
    public decision = new Subject<boolean>();

    @assignable()
    @Input()
    public formControl: FormControl;

    private form: FormGroup;

    private errors: string[] = [];


    constructor() {

        super();
        this.content           = "Are you sure?";
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
