import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {noop} from "../../../lib/utils.lib";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-key-value-input",
    styleUrls: ["./key-value-input.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KeyValueInputComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => KeyValueInputComponent),
            multi: true
        }
    ],
    template: `

        <div class="key-container col-sm-5"
             *ngIf="form.controls['keyForm'].value !== null">

            <i class="fa fa-times-circle error-validation-icon"
               *ngIf="validation.errors.length"
               [ct-tooltip]="errors"></i>

            <i class="fa fa-warning warning-validation-icon"
               [ct-tooltip]="warnings"
               *ngIf="validation.warnings.length && !validation.errors.length"></i>

            <ct-tooltip-content #warnings>
                <div class="text-console-warning px-1" *ngFor="let warning of validation.warnings">{{ warning }}</div>
            </ct-tooltip-content>

            <ct-tooltip-content #errors>
                <div class="text-console-error px-1" *ngFor="let error of validation.errors">{{ error }}</div>
            </ct-tooltip-content>

            <input class="ellipsis form-control key-input"
                   [class.col-sm-12]="form.controls['keyForm'].valid"
                   [class.col-sm-11]="!form.controls['keyForm'].valid"
                   *ngIf="form.controls['keyForm']"
                   [formControl]="form.controls['keyForm']"/>
        </div>

        <input *ngIf="form.controls['valueForm'] && readonly"
               [class.col-sm-11]="form.controls['keyForm'].value === null"
               [class.col-sm-6]="form.controls['keyForm'].value !== null"
               [class.half-width-value-input]="form.controls['keyForm'].value !== null"
               class="readonly-value-input"
               [readonly]="readonly"
               [formControl]="form.controls['valueForm']"/>

        <ct-expression-input
            *ngIf="form.controls['valueForm'] && !readonly"
            class="col-sm-6"
            [context]="context"
            [formControl]="form.controls['valueForm']">
        </ct-expression-input>

        <ng-content></ng-content>
    `
})
export class KeyValueInputComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    public context: { $job: any } = {$job: {}};

    @Input()
    public keyValidator = () => null;

    @Input()
    private isDuplicate = false;

    private onTouched = noop;

    private propagateChange = noop;

    private form = new FormGroup({});

    private readonly = false;

    private duplicateErrorMessage = "Duplicate keys are not allowed.";

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    private validation: { warnings: string[], errors: string[] } = {
        warnings: [],
        errors: []
    };

    validate() {
        this.validation.errors = [];
        this.validation.warnings = [];

        this.checkIfDuplicate();

        if (this.form.controls["keyForm"].errors) {
            if (this.form.controls["keyForm"].errors["error"] && this.form.controls["keyForm"].errors["error"].message) {
                this.validation.errors.push(this.form.controls["keyForm"].errors["error"].message);
            }

            if (this.form.controls["keyForm"].errors["warning"] && this.form.controls["keyForm"].errors["warning"].message) {
                this.validation.warnings.push(this.form.controls["keyForm"].errors["warning"].message);
            }
        }

        return this.form.valid ? null : {validation: this.validation};
    }

    ngOnChanges() {
        this.checkIfDuplicate();
    }

    writeValue(input: {
                   key?: string,
                   value: string | ExpressionModel,
                   readonly?: boolean
               }): void {

        this.readonly = input.readonly || false;

        this.form = this.formBuilder.group({
            keyForm: [input.key, this.keyValidator],
            valueForm: [input.value]
        });

        this.tracked = this.form.valueChanges
            .distinctUntilChanged()
            .subscribe(() => {
                const key = this.form.controls["keyForm"].valid ? this.form.controls["keyForm"].value : "";

                this.propagateChange({
                    key: key,
                    value: this.form.controls["valueForm"].value,
                    readonly: input.readonly
                });
            });
    }

    private checkIfDuplicate(): void {
        const index = this.validation.errors.indexOf(this.duplicateErrorMessage);

        if (this.isDuplicate && index === -1) {
            this.validation.errors.push(this.duplicateErrorMessage);
        }

        if (!this.isDuplicate && index !== -1) {
            this.validation.errors.splice(index, 1);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
