import {Component, forwardRef, Input} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroup, FormBuilder, NG_VALIDATORS} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";

require("./key-value-input.component.scss");

@Component({
    selector: "ct-key-value-input",
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
                 
                 <i class="fa fa-times-circle validation-icon key-validation-icon"
                    [ct-tooltip]="keyTooltip"
                     *ngIf="errorMessages.length"></i>
                
                <ct-tooltip-content #keyTooltip>
                     <div class="error-text px-1" *ngFor="let error of errorMessages">{{ error }}</div>
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
export class KeyValueInputComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public context: {$job: any} = { $job: {} };

    @Input()
    public keyValidator = () => null;

    @Input()
    public valueValidator = () => null;

    @Input()
    public isDuplicate = false;

    public errorMessages: string[] = [];

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private form = new FormGroup({});

    private readonly = false;

    private duplicateErrorMessage = "Duplicate keys are not allowed.";

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    validate() {
        this.errorMessages = [];

        this.checkIfDuplicate();

        if (!this.form.controls['keyForm'].valid && this.form.controls['keyForm'].errors) {
            const errorMessage = this.form.controls['keyForm'].errors['message'] ?
                this.form.controls['keyForm'].errors['message']:
                "Value is not valid.";

            this.errorMessages.push(errorMessage);
        }

        if (!this.form.controls['valueForm'].valid && this.form.controls['valueForm'].errors) {
            const errorMessage = this.form.controls['valueForm'].errors['message'] ?
                this.form.controls['valueForm'].errors['message']:
                "Value is not valid.";

            this.errorMessages.push(errorMessage);
        }

        return this.form.valid ? null: { messages: this.errorMessages };
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
            valueForm: [input.value, this.valueValidator]
        });

        this.tracked = this.form.valueChanges
            .distinctUntilChanged()
            .subscribe(_ => {
                const keyValue = this.form.controls['keyForm'].valid ? this.form.controls['keyForm'].value : "";
                const valueInput = this.form.controls['valueForm'].valid ? this.form.controls['valueForm'].value : "";

                this.propagateChange({
                    key: keyValue,
                    value: valueInput,
                    readonly: input.readonly
                });
            });
    }

    private checkIfDuplicate() {
        const index = this.errorMessages.indexOf(this.duplicateErrorMessage);

        if (this.isDuplicate && index === -1) {
            this.errorMessages.push(this.duplicateErrorMessage);
        }

        if (!this.isDuplicate && index !== -1) {
            this.errorMessages.splice(index, 1);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
