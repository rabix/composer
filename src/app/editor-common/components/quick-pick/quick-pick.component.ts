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
                <button class="btn btn-secondary"
                        type="button"
                        [class.active]="computedVal?.toString() === item.value.toString()"
                        [disabled]="readonly"
                        (click)="selectDefault(item.value)">
                    {{ item.label }}
                </button>
            </div>
        </div>

        <button type="button"
                class="btn btn-secondary custom-btn"
                *ngIf="!showCustom && !readonly"
                (click)="addCustom(true)">Custom
        </button>

        <div *ngIf="showCustom" class="removable-form-control">
            <ct-expression-input [context]="context"
                                 [formControl]="form.controls['custom']"
                                 [readonly]="readonly"
                                 [type]="type">
            </ct-expression-input>

            <span class="remove-icon"
                  (click)="removeCustom($event, true)">
                <i *ngIf="!readonly" [ct-tooltip]="'Delete'" class="fa fa-trash clickable"></i>
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
    context: any = {};

    @Input()
    type: "string" | "number" = "string";

    @Output()
    update = new AsyncSubject<any>();

    showCustom = false;

    list: { label: string, value: string | number }[] = [];

    form = new FormGroup({});

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
    }

    writeValue(value: ExpressionModel): void {
        if (this._value && this._value.serialize() === value.serialize()) {
            return;
        }

        this._value = value;

        if (value instanceof ExpressionModel) {
            this.computedVal = <string | number>value.serialize();
        } else {
            console.warn(`ct-quick-pick expected value to be instanceof ExpressionModel`);
        }

        this.showCustom = this.showCustom || !this.list.filter(item => {
                return this.computedVal !== undefined && item.value.toString() === this.computedVal.toString();
            }).length && this.computedVal !== undefined;

        if (this.showCustom) {
            this.addCustom();
        } else {
            this.removeCustom();
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    addCustom(reset?: boolean): void {
        this.showCustom = true;

        if (reset) {
            this._value.setValue("", this.type);
        }

        this.form.setControl("custom", new FormControl(this._value));

        this.tracked = this.form.controls["custom"].valueChanges.subscribe(expr => {
            this._value      = expr;
            this.computedVal = expr.serialize();
            this.onChange(this._value);
        });
    }

    removeCustom(event?: Event, reset?: boolean): void {
        if (!!event) {
            event.stopPropagation();
            this.modal.delete("custom resource").then(() => {
                this.removeFunction(reset);
            }, err => console.warn);
        } else {
            this.removeFunction(reset);
        }
    }

    removeFunction(reset?: boolean) {
        this.form.removeControl("custom");
        this.showCustom = false;

        if (reset) {
            this._value.setValue("", this.type);
            this.onChange(this._value);
        }
    }

    selectDefault(prim) {
        this._value.setValue(prim, this.type);
        this.computedVal = prim;
        this.onChange(this._value);
    }
}
