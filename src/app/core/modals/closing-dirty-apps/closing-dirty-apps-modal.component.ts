import {Component, Input, Output} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {last} from "rxjs/operators";

@Component({
    styleUrls: ["closing-dirty-apps-modal.component.scss"],
    selector: "ct-modal-closing-dirty-apps",
    template: `
        <form (ngSubmit)="decide('confirm')">
            <div class="body p-1">
                <span>Do you want to save the changes you've made to the document?<br/>
                    Once you close this tab, your changes will be lost if you don't save them.</span>
            </div>

            <div class="modal-footer">
                <button class="btn btn-secondary discard-button" data-test="dirty-app-modal-discard-button" type="button"
                        (click)="decide('discard')">{{ discardLabel }}
                </button>

                <button class="btn btn-secondary" data-test="dirty-app-modal-cancel-button" (click)="decide('cancel')"
                        type="button">
                    {{ cancellationLabel }}
                </button>
                <button class="btn btn-primary" data-test="dirty-app-modal-save-button" type="submit">{{ confirmationLabel }}</button>
            </div>
        </form>
    `
})
export class ClosingDirtyAppsModalComponent {

    @Input() content = "Are you sure?";

    @Input() cancellationLabel = "Cancel";

    @Input() confirmationLabel = "Yes";

    @Input() discardLabel = "Discard";

    @Output() onCancel = () => void 0;

    @Output() onDiscard = () => void 0;

    @Output() onConfirm: () => void | Promise<any> | Observable<any> = () => void 0;

    @Output() inAnyCase = () => void 0;

    decide(decision: "confirm" | "discard" | "cancel"): void {
        let action;
        switch (decision) {
            case "confirm":
                action = this.onConfirm();
                break;
            case "discard":
                action = this.onDiscard();
                break;
            default:
                action = this.onCancel();
        }

        if (action instanceof Promise) {
            action.then(() => this.inAnyCase());
        } else if (action instanceof Observable) {
            action.pipe(last()).subscribe(() => this.inAnyCase());
        } else {
            this.inAnyCase();
        }

    }
}
