import {Component, Input, Output} from "@angular/core";
import {Subject} from "rxjs";
import {assignable} from "../../../decorators/index";
@Component({
    selector: "ct-modal-confirm",
    template: `
        <form (ngSubmit)="decision.next(true)">
            <div class="modal-body">
                <span [innerHTML]="content"></span>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary btn-sm" (click)="decision.next(false)" type="button">{{ cancellationLabel }}</button>
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
    public decision = new Subject<boolean>();

    constructor() {

        this.content           = "Are you sure?";
        this.cancellationLabel = "Cancel";
        this.confirmationLabel = "Yes";
    }
}
