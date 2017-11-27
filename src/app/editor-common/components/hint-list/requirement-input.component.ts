import {Component, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {ExpressionModel, RequirementBaseModel} from "cwlts/models";
import {noop} from "../../../lib/utils.lib";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-requirement-input",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RequirementInputComponent),
            multi: true
        }
    ],
    template: `

        <div class="requirement-row" *ngIf="editType === 'none'">
            <input type="text" readonly class="form-control" [value]="value">
        </div>

        <div *ngIf="editType === 'half'" class="requirement-row">
            <!--Class autocomplete component-->
            <ct-auto-complete [options]="classSuggest"
                              *ngIf="classSuggest"
                              mono="true"
                              [formControl]="form.controls['class']">
            </ct-auto-complete>

            <!--Regular input if no autocomplete for classes provided-->
            <input type="text" class="form-control"
                   *ngIf="!classSuggest"
                   [formControl]="form.controls['class']">
            <input type="text" [value]="value" readonly class="form-control col-xs-6">
        </div>

        <div *ngIf="editType === 'full'" class="requirement-row">
            <!--Class autocomplete component-->
            <ct-auto-complete [options]="classSuggest"
                              *ngIf="classSuggest"
                              mono="true"
                              [formControl]="form.controls['class']">
            </ct-auto-complete>

            <!--Regular input if no autocomplete for classes provided-->
            <input type="text"
                   *ngIf="!classSuggest"
                   class="form-control"
                   [formControl]="form.controls['class']">
            <ct-expression-input
                    [context]="context"
                    [readonly]="readonly"
                    [formControl]="form.controls['value']"
            ></ct-expression-input>
        </div>

    `,
    styleUrls: ["./requirement-input.component.scss"]
})
export class RequirementInputComponent extends DirectiveBase implements ControlValueAccessor {

    private onChange = noop;

    private onTouch = noop;

    @Input()
    classSuggest: string[];

    @Input()
    readonly = false;

    @Input()
    context: any = {};

    editType: "half" | "full" | "none";

    "class": string;

    value: ExpressionModel | string;

    req: RequirementBaseModel;

    form = new FormGroup({
        class: new FormControl(),
        value: new FormControl()
    });

    writeValue(obj: RequirementBaseModel): void {

        if (obj.class !== undefined && obj.value !== undefined) {
            this.editType = "full";
            this.form.controls["class"].setValue(obj.class, {onlySelf: true});
            if (this.readonly) {
                this.form.controls["class"].disable({onlySelf: true, emitEvent: false});
            }

            if (obj.value instanceof ExpressionModel) {
                this.form.controls["value"].setValue(obj.value, {onlySelf: true, emitEvent: false});
            } else {
                this.editType = "half";
                this.value = JSON.stringify(obj.value);
            }

        } else if (obj.class !== undefined && obj.value === undefined) {
            this.editType = "half";
            this.form.controls["class"].setValue(obj.class, {onlySelf: true, emitEvent: false});
            if (this.readonly) {
                this.form.controls["class"].disable({onlySelf: true, emitEvent: false});
            }
            this.value = JSON.stringify(obj.customProps);

        } else {
            this.editType = "none";
            this.value    = JSON.stringify(obj.customProps);
        }

        this.req = obj;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    constructor() {
        super();

        this.tracked = this.form.valueChanges.distinctUntilChanged().subscribe(form => {
            if (this.req) {
                this.req.value = form.value;
                this.req.class = form.class;

                this.onChange(this.req);
                this.onTouch();
            }
        });
    }

}
