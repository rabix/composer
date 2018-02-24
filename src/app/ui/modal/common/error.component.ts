import {Component, Input} from "@angular/core";

@Component({
    styleUrls: ["error.component.scss"],
    selector: "ct-modal-error",
    template: `
        <form (ngSubmit)="onConfirm()">
            <div class="body p-1">
                <span [innerHTML]="content"></span>
            </div>
            <div class="footer pr-1 pb-1">
                <button class="btn btn-primary" type="submit">{{ confirmationLabel }}</button>
            </div>
        </form>
    `
})
export class ErrorComponent {

    @Input()
    content: string;

    @Input()
    confirmationLabel: string;

    @Input()
    onConfirm: Function;

    constructor() {
    }
}
