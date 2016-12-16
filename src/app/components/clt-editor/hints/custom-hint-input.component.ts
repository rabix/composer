import {Component, forwardRef, Input} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl} from "@angular/forms";
import {ExpressionModel, RequirementBaseModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";

require("./custom-hint-input.component.scss");

@Component({
    selector: "[ct-hint-list-input]",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => HintListInputComponent),
            multi: true
        }
    ],
    template: `
           <input class="col-sm-5 ellipsis form-control hint-class-input"
               *ngIf="classForm && !readonly"
               [formControl]="classForm"/>
               
            <ct-expression-input 
                    *ngIf="valueForm"
                    class="ellipsis col-sm-6"
                    [context]="context"
                    [formControl]="valueForm">
            </ct-expression-input>
            
            <ng-content></ng-content>
    `
})
export class HintListInputComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public context: {$job: any} = {};

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private classForm: FormControl;

    private valueForm: FormControl;

    private input: RequirementBaseModel;

    private validateClassForm(c: FormControl) {

        if (c.value  === "sbg:MemRequirement"
            || c.value === "sbg:CPURequirement"
            || c.value === "DockerRequirement") {

            return {
                valid: false,
                message: "Class name is not valid"
            }
        }

        return null;
    }

    writeValue(hintInput: RequirementBaseModel): void {

        this.input = hintInput;

        this.classForm = new FormControl(hintInput.class, this.validateClassForm);
        this.valueForm = new FormControl(hintInput.value);

        this.tracked = this.classForm.valueChanges
            .debounceTime(300)
            .distinctUntilChanged()
            .subscribe((value: string) => {
                this.input['class'] = this.classForm.valid ? value : "";
                this.propagateChange(this.input);
            });

        this.tracked = this.valueForm.valueChanges
            .subscribe((value: ExpressionModel) => {
                this.input.updateValue(value);
                this.propagateChange(this.input);
            });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
