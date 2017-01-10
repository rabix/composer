import {Component, Input, forwardRef, OnInit, Output} from "@angular/core";
import {FormControl, NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";
import {noop} from "../../../lib/utils.lib";
import {AsyncSubject} from "rxjs";
import {Expression} from "cwlts/mappings/d2sb/Expression";

require("./quick-pick.component.scss");

@Component({
    selector: "ct-quick-pick",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => QuickPickComponent),
            multi: true
        }
    ],
    template: `
    <div class="suggestions" *ngIf="!showCustom">
    
            <div class="radio-container" *ngFor="let item of list">
                <input type="radio"
                       [class.selected]="computedVal === item.value"
                       [value]="item.value"
                       [formControl]="radioForm"
                       id="{{item.label}}"
                       required>
                       
                <label class="radio-label btn btn-secondary"
                        for="{{item.label}}"
                       [class.selected]="computedVal === item.value">
                       {{ item.label }}
               </label>
           </div>
    </div>
    
    <button type="button"
            class="btn btn-primary"
            *ngIf="!showCustom"
            (click)="createControl('')">Custom
    </button>

    <div *ngIf="showCustom" class="removable-form-control">
        <ct-expression-input [context]="context" 
                             [formControl]="customControl" 
                             [type]="type">
        </ct-expression-input>
        
        <span class="remove-icon" (click)="removeControl()">
            <i class="fa fa-trash"></i>
        </span>
    </div>
    `
})
export class QuickPickComponent extends ComponentBase implements ControlValueAccessor, OnInit {

    @Input()
    public suggestions: {[label: string]: string | number} | string[];

    @Input()
    public context: any;

    @Input()
    public type: "string" | "number" = "string";

    @Output()
    public update = new AsyncSubject<any>();

    private showCustom = false;

    private list: {label: string, value: string | number}[] = [];

    private customControl: FormControl;

    private onTouch = noop;

    private onChange = noop;

    private computedVal: number | string | Expression;

    private radioForm: FormControl;

    get value(): string|number|ExpressionModel {
        return this._value;
    }

    set value(value: string|number|ExpressionModel) {
        this.onChange(value);
        this._value = value;
        let val     = value;

        if (value instanceof ExpressionModel && value.type !== "expression") {
            val = <string | number>value.serialize();
        }

        if (this.list && val !== '' && val !== null && val !== undefined) {
            this.showCustom = !this.list.filter(item => {
                return item.value === val;
            }).length;
        } else {
            if (this.customControl) this.removeControl();
            this.showCustom = false;
        }

        this.computedVal = <string | number> val;

        this.radioForm = new FormControl(this.computedVal);
        this.radioForm.valueChanges.subscribe(value => {
            this.setValue(value);
        });

        if (this.showCustom) this.createControl(value);
    }

    private _value: string | number | ExpressionModel;

    private setValue(val: string | number) {
        this.onTouch();
        this.computedVal = val;
        if (this._value instanceof ExpressionModel) {
            this.value = new ExpressionModel("", val);
        } else {
            this.value = val;
        }
    }

    ngOnInit() {
        if (this.suggestions) {
            if (Array.isArray(this.suggestions)) {
                const type = typeof this.suggestions[0];
                if (type !== "string") {
                    console.warn(`Please provide ct-quick-pick with correct suggested value format. Expected "string" got "${type}"`)
                } else {
                    (<string[]>this.suggestions).forEach(item => {
                        this.list = this.list.concat([{label: item, value: item}]);
                    });
                }
            } else {
                this.list = Object.keys(this.suggestions).map(key => {
                    return {
                        label: key,
                        value: this.suggestions[key]
                    }
                });
            }
        } else {
            console.warn(`Please provide ct-quick-pick with a list of suggested values
available types: {[label: string]: string | number} | string[]`)
        }
    }

    writeValue(value: string | number | ExpressionModel): void {
        if (this.value !== value) {
            this.value = value;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    private createControl(value: number | string | ExpressionModel): void {
        this.customControl = new FormControl(value);
        this.showCustom    = true;

        this.tracked = this.customControl.valueChanges
            .subscribe((value: any) => {
                this.onTouch();
                this.value = value;
            });
    }

    private removeControl(): void {
        if (this.customControl) {
            this.computedVal   = "";
            this.showCustom    = false;
            this.customControl = undefined;

            if (this._value instanceof ExpressionModel) {
                this.value = new ExpressionModel("", "");
            } else {
                this.value = "";
            }

        }
    }
}
