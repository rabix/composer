import {AfterViewInit, Component, Input, OnInit, Output} from "@angular/core";
import {FormControl, FormGroup} from "@angular/forms";
import {Subject} from "rxjs/Subject";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    styleUrls: ["prompt.component.scss"],
    selector: "ct-modal-prompt",
    template: `
        <form (ngSubmit)="decision.next(answer.value)" [formGroup]="form">
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
                <button class="btn btn-secondary" (click)="decision.next(false)" type="button">
                    {{ cancellationLabel }}
                </button>
                <button [disabled]="form.invalid" class="btn btn-success" type="submit">
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
    decision = new Subject<boolean>();

    @Input()
    formControl: FormControl;

    form: FormGroup;

    errors: string[] = [];

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
            this.errors = Object.keys(this.formControl.errors || {})
                .map(key => this.formControl.errors[key]);
        });
    }
}
