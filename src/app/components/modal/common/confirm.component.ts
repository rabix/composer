import {Component, Input, Output} from "@angular/core";
import {Subject} from "rxjs";
import {assignable} from "../../../decorators/index";
@Component({
    selector: "ct-modal-confirm",
    template: `
        <form (ngSubmit)="confirm.next(true)">
            <div class="modal-body">
                <span [innerHTML]="content"></span>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary btn-sm" (click)="cancel.next(true)" type="button">{{ cancellationLabel }}</button>
                <button class="btn btn-primary btn-sm" type="submit" >{{ confirmationLabel }}</button>
            </div>
        </form>
    `
})
export class ConfirmComponent {

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
    public confirm: Subject<any>;

    @assignable("next")
    @Output()
    public cancel: Subject<any>;

    constructor() {
        this.confirm = new Subject<any>();
        this.cancel  = new Subject<any>();

        this.content           = "Are you sure?";
        this.cancellationLabel = "Cancel";
        this.confirmationLabel = "Yes";
    }
}
