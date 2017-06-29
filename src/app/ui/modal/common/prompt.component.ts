import {AfterViewInit, Component, HostBinding, Input, OnInit, Output} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {AsyncSubject} from "rxjs/AsyncSubject";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    styleUrls: ["prompt.component.scss"],
    selector: "ct-modal-prompt",
    template: `
        <form (ngSubmit)="decide(answer.value)" [formGroup]="form">
            <div class="body p-1">
                <div class="form-group">
                    <label [innerHTML]="content"></label>
                    <input #answer autofocus [formControl]="formControl" class="form-control"/>
                </div>
            </div>
            <div *ngIf="errors.length > 0" class="m-1 alert alert-warning">
                <div *ngFor="let err of errors">{{ err }}</div>
            </div>
            <div class="footer pr-1 pb-1">
                <button class="btn btn-secondary" (click)="decide(false)" type="button">
                    {{ cancellationLabel }}
                </button>
                <button [disabled]="form.invalid" class="btn btn-primary" type="submit">
                    {{ confirmationLabel }}
                </button>
            </div>
        </form>
    `
})
export class PromptComponent extends DirectiveBase implements OnInit, AfterViewInit {

    @Input()
    content: string;

    @Input()
    cancellationLabel: string;

    @Input()
    confirmationLabel: string;

    @Output()
    decision = new AsyncSubject<boolean>();

    @Input()
    formControl: FormControl;

    @Input()
    @HostBinding("style.min-width")
    minWidth: string = "500px";

    form: FormGroup;

    errors: string[] = [];

    constructor() {

        super();
        this.content           = "Are you sure?";
        this.cancellationLabel = "Cancel";
        this.confirmationLabel = "Yes";

        this.form = new FormGroup({});
    }

    ngOnInit() {
        if (!this.formControl) {
            this.formControl = new FormControl("");
        }
        this.form.addControl("formControl", this.formControl);
    }

    ngAfterViewInit() {
        this.tracked = this.formControl.statusChanges.subscribe(_ => {
            this.errors = Object.keys(this.formControl.errors || {})
                .map(key => this.formControl.errors[key]);
        });
    }

    decide(answer) {
        this.decision.next(answer);
        this.decision.complete();
    }
}
