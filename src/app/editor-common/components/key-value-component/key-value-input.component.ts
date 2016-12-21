import {Component, forwardRef, Input} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl} from "@angular/forms";
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
               [formControl]="keyForm"/>
               
            <ct-expression-input 
                    class="ellipsis col-sm-6"
                    [context]="context"
                    [formControl]="valueForm">
            </ct-expression-input>
            
            <ng-content></ng-content>
    `
})
export class KeyValueInputComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public context: {$job: any} = {};

    @Input()
    public keyValidator? = () => null;

    @Input()
    public valueValidator? = () => null;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private keyForm: FormControl;

    private valueForm: FormControl;

    writeValue(input: {key: string, value: string | ExpressionModel}): void {

        this.keyForm = new FormControl(input.key, this.keyValidator);
        this.valueForm = new FormControl(input.value, this.valueValidator);

        this.tracked = this.keyForm.valueChanges
            .debounceTime(300)
            .distinctUntilChanged()
            .subscribe((value: string) => {

                const keyValue = this.keyForm.valid ? value : "";
                const valueInput = this.valueForm.valid ? this.valueForm.value : "";

                this.propagateChange({
                    key: keyValue,
                    value: valueInput
                });
            });

        this.tracked = this.valueForm.valueChanges
            .subscribe((value: ExpressionModel) => {

                const keyValue = this.keyForm.valid ? this.keyForm.value : "";
                const valueInput = this.valueForm.valid ? value : "";

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
