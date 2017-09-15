import {Component, Input, Output} from "@angular/core";
import {Subject} from "rxjs/Subject";

@Component({
    styleUrls: ["confirm.component.scss"],
    selector: "ct-modal-confirm",
    template: `
        <form (ngSubmit)="decision.next(true)">
            <div class="body p-1">
                <span [innerHTML]="content"></span>
            </div>
            <div class="footer pl-1 pr-1 pb-1">
                <button class="btn btn-secondary discard-button" *ngIf="showDiscardButton"
                        (click)="decision.next(false)" type="button">{{ discardLabel }}
                </button>

                <button class="btn btn-secondary" (click)="cancel.next(true)" type="button">{{ cancellationLabel }}
                </button>
                <button class="btn btn-primary" type="submit">{{ confirmationLabel }}</button>
            </div>
        </form>
    `
})
export class ConfirmComponent {

    @Input()
    public content: string;

    @Input()
    public showDiscardButton: string;

    @Input()
    public cancellationLabel: string;

    @Input()
    public confirmationLabel: string;

    @Input()
    public discardLabel: string;

    @Output()
    public decision = new Subject<boolean>();

    @Output()
    public cancel = new Subject<any>();

    constructor() {
        this.content = "Are you sure?";
        this.cancellationLabel = "Cancel";
        this.confirmationLabel = "Yes";
        this.discardLabel = "Don't";
    }
}
