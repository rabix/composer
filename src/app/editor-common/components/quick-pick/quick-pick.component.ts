import {Component, Input, forwardRef, OnInit, Output} from "@angular/core";
import {FormControl, Validators, NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";
import {noop} from "../../../lib/utils.lib";
import {BehaviorSubject} from "rxjs";

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
<div>
    <div class="suggestions" *ngIf="!showCustom">

        <button class="btn btn-secondary"
                [class.selected]="value === item.value"
                (click)="value = item.value; onTouch();"
                *ngFor="let item of list">
            {{ item.label }}
        </button>
    </div>
    
    <button type="button"
            class="btn btn-primary"
            *ngIf="!showCustom"
            (click)="createControl('')">Custom
    </button>

    <div class="expression-input-wrapper content-wrapper"
         *ngIf="showCustom" ngSwitch="type">
         

        <input *ngSwitchCase="'number'" type="number" class="form-control" [formControl]="customControl">
        <input *ngSwitchDefault type="number" class="form-control" [formControl]="customControl">
        
        <!--<expression-input class="col-sm-11 expression-input"-->
        <!--[context]="context"-->
        <!--[formControl]="customControl">-->
        <!--</expression-input>-->

        <span class="col-sm-1">
            <i class="fa fa-trash clear-icon" (click)="removeControl()"></i>
        </span>
    </div>
</div>
    `
})
export class QuickPickComponent extends ComponentBase implements ControlValueAccessor, OnInit {

    @Input()
    public suggestions: {[label: string]: string | number} | string[];

    @Input()
    public context: any;

    @Input()
    public type: "text" | "number" = "text";

    @Output()
    public update = BehaviorSubject<any>();

    private showCustom = false;

    private list: {label: string, value: string | number}[] = [];

    private customControl: FormControl;

    private onTouch = noop;

    private onChange = noop;

    get value(): string|number|ExpressionModel {
        return this._value;
    }

    set value(value: string|number|ExpressionModel) {
        this.onChange(value);
        this._value = value;

        if (this.list && value !== '' || value !== null || value !== undefined) {
            this.showCustom = !this.list.filter(item => {
                return item.value === value;
            }).length;
        } else {
            if (this.customControl) this.removeControl();
            this.showCustom = false;
        }

        if (this.showCustom) this.createControl(value);
    }

    private _value: string | number | ExpressionModel;

    ngOnInit() {
        if (this.suggestions) {
            if (Array.isArray(this.suggestions)) {
                let type = typeof this.suggestions[0];
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
        this.value = value;
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
            this.customControl.setValue("");
            this.value         = "";
            this.showCustom    = false;
            this.customControl = undefined;
        }
    }
}
