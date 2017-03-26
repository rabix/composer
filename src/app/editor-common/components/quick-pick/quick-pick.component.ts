import {Component, forwardRef, Input, OnInit, Output} from "@angular/core";
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Expression} from "cwlts/mappings/d2sb/Expression";
import {ExpressionModel} from "cwlts/models";
import {AsyncSubject} from "rxjs/AsyncSubject";
import {noop} from "../../../lib/utils.lib";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-quick-pick",
    styleUrls: ["./quick-pick.component.scss"],
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
                       [value]="item.value"
                       [formControl]="form.controls['radio']"
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
                class="btn btn-secondary custom-btn"
                *ngIf="!showCustom && !readonly"
                (click)="addCustom('')">Custom
        </button>

        <div *ngIf="showCustom" class="removable-form-control">
            <ct-expression-input [context]="context"
                                 [formControl]="form.controls['custom']"
                                 [readonly]="readonly"
                                 [type]="type">
            </ct-expression-input>

            <span class="remove-icon clickable ml-1 text-hover-danger"
                  (click)="removeCustom($event)">
                <i *ngIf="!readonly" [ct-tooltip]="'Delete'" class="fa fa-trash"></i>
            </span>
        </div>
    `
})
export class QuickPickComponent extends DirectiveBase implements ControlValueAccessor, OnInit {

    @Input()
    readonly = false;

    @Input()
    suggestions: { [label: string]: string | number } | string[];

    @Input()
    context: any;

    @Input()
    type: "string" | "number" = "string";

    @Output()
    update = new AsyncSubject<any>();

    showCustom = false;

    list: { label: string, value: string | number }[] = [];

    form = new FormGroup({
        custom: new FormControl(),
        radio: new FormControl()
    });

    private onTouch = noop;

    private onChange = noop;

    computedVal: number | string | Expression;

    get value(): ExpressionModel {
        return this._value;
    }

    set value(value: ExpressionModel) {
        this._value = value;
    }

    private _value: ExpressionModel;

    constructor(private modal: ModalService) {
        super();
    }

    ngOnInit() {
        // parses suggestions list for the radio buttons
        if (this.suggestions) {
            if (Array.isArray(this.suggestions)) {
                const type = typeof this.suggestions[0];
                if (type !== "string") {
                    console.warn(`Please provide ct-quick-pick with correct 
                    suggested value format. Expected "string" got "${type}"`);
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
                    };
                });
            }
        } else {
            console.warn(`Please provide ct-quick-pick with a list of suggested values
available types: {[label: string]: string | number} | string[]`);
        }

        // set up watcher for custom form
        this.tracked = this.form.controls["custom"].valueChanges.skip(1).subscribe((expr: ExpressionModel) => {
            this.computedVal = expr.serialize();
            this._value      = expr;
            this.onChange(this._value);
            this.onTouch();
        });

        // set up watcher for radio button form
        this.tracked = this.form.controls["radio"].valueChanges.skip(1).subscribe(primitive => {
            this._value.setValue(primitive, this.type);
            this.computedVal = primitive;
            this.onChange(this._value);
            this.onTouch();
        });
    }

    writeValue(value: ExpressionModel): void {

        this.onChange(value);
        this._value = value;

        if (value instanceof ExpressionModel) {
            this.computedVal = <string | number>value.serialize();
        } else {
            console.warn(`ct-quick-pick expected value to be instanceof ExpressionModel`);
        }

        this.showCustom = !this.list.filter(item => {
                return item.value === this.computedVal;
            }).length && this.computedVal !== undefined;

        this.form.controls["radio"].setValue(this.computedVal);
        this.form.controls["custom"].setValue(value);
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    addCustom(value: string): void {
        this.showCustom = true;
        this._value.setValue(value, this.type);
    }

    removeCustom(event?: Event): void {
        if (!!event) {
            event.stopPropagation();
            this.modal.confirm({
                title: "Really Remove?",
                content: `Are you sure that you want to remove this custom resource?`,
                cancellationLabel: "No, keep it",
                confirmationLabel: "Yes, remove it"
            }).then(() => {
                this.removeFunction();
            }, err => console.warn);
        } else {
            this.removeFunction();
        }
    }

    removeFunction() {
        this.showCustom = false;
        this._value.setValue("", this.type);
    }
}
