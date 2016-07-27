import {Component, Input, Output} from "@angular/core";
import {Subject} from "rxjs";
import any = jasmine.any;
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

    @Input()
    public content: string;

    @Input()
    public cancellationLabel: string;

    @Input()
    public confirmationLabel: string;

    @Output()
    public confirm: Subject<any>;

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
