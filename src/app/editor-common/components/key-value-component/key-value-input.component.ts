import {Component, forwardRef, Input} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroup, FormBuilder} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";

require("./key-value-input.component.scss");

@Component({
    selector: "[ct-key-value-input]",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KeyValueInputComponent),
            multi: true
        }
    ],
    template: `
            <input class="col-sm-5 ellipsis form-control hint-class-input"
               *ngIf="form.controls['keyForm']"
               [formControl]="form.controls['keyForm']"/>
               
            <ct-expression-input 
                    *ngIf="form.controls['valueForm']"
                    class="ellipsis col-sm-6"
                    [context]="context"
                    [formControl]="form.controls['valueForm']">
            </ct-expression-input>
            
            <ng-content></ng-content>
    `
})
export class KeyValueInputComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public context: {$job: any} = {};

    @Input()
    public keyValidator = () => null;

    @Input()
    public valueValidator = () => null;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private form = new FormGroup({});

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(input: {key: string, value: string | ExpressionModel}): void {

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
                    value: valueInput
                });
            });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
