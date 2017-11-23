import {Component, Input, OnInit, Output, ViewEncapsulation} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {CommandArgumentModel} from "cwlts/models";
import {Subject} from "rxjs/Subject";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "ct-argument-inspector",
    template: `
        <form [formGroup]="form">
            <div class="form-group">
                <label>Use command line binding</label>
                <span class="pull-right">
                    <ct-toggle-slider [formControl]="form.controls['hasBinding']"></ct-toggle-slider>
                </span>
            </div>

            <div *ngIf="argument.hasBinding">
                <!--Prefix Field-->
                <div class="form-group">
                    <label class="form-control-label">Prefix</label>
                    <input type="text"
                           class="form-control"
                           [formControl]="form.controls['prefix']">
                </div>

                <!--Expression Field-->
                <div class="form-group">
                    <label class="form-control-label">Expression</label>
                    <ct-expression-input
                        [context]="context"
                        [readonly]="readonly"
                        [formControl]="form.controls['valueFrom']">
                    </ct-expression-input>
                </div>

                <div class="form-group">
                    <label>Separate value and prefix</label>
                    <span class="pull-right">
                        <ct-toggle-slider [formControl]="form.controls['separate']"></ct-toggle-slider>
                    </span>
                </div>

                <!--Position Field-->
                <div class="form-group">
                    <label class="form-control-label">Position</label>
                    <input type="number"
                           class="form-control"
                           [formControl]="form.controls['position']">
                </div>

                <div class="form-group" *ngIf="argument.hasShellQuote">
                    <label>shellQuote</label>
                    <span class="pull-right">
                    <ct-toggle-slider [formControl]="form.controls['shellQuote']"></ct-toggle-slider>
                </span>
                </div>
            </div>

            <div *ngIf="!argument.hasBinding">
                <div class="form-group">
                    <label class="form-control-label">Value</label>
                    <input type="text"
                           class="form-control"
                           *ngIf="!argument.hasExprPrimitive"
                           [readonly]="readonly"
                           [formControl]="form.controls['primitive']">

                    <ct-expression-input type="string"
                                         [context]="context"
                                         *ngIf="argument.hasExprPrimitive"
                                         [formControl]="form.controls['primitive']">

                    </ct-expression-input>
                </div>
            </div>

        </form>
    `
})
export class ArgumentInspectorComponent extends DirectiveBase implements OnInit {

    disabled = false;

    get readonly(): boolean {
        return this.disabled;
    }

    @Input("readonly")
    set readonly(value: boolean) {
        this.disabled = value;
        if (this.form) {
            this.setDisabledState(value);
        }
    }

    @Input()
    public argument: CommandArgumentModel;

    public form: FormGroup;

    /** Context in which expression should be evaluated */
    @Input()
    public context: { $job: any };

    @Output()
    public save = new Subject<FormGroup>();

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    ngOnInit() {
        this.form = this.formBuilder.group({
            hasBinding: new FormControl({value: this.argument.hasBinding, disabled: this.readonly}),
            valueFrom: new FormControl(this.argument.valueFrom),
            separate: new FormControl({value: this.argument.separate !== false, disabled: this.readonly}),
            position: new FormControl({value: this.argument.position || 0, disabled: this.readonly}),
            prefix: new FormControl({value: this.argument.prefix || "", disabled: this.readonly}),
            primitive: new FormControl(this.argument.primitive || ""),
            shellQuote: new FormControl({value: this.argument.shellQuote, disabled: this.readonly})
        });

        this.tracked = this.form.controls["hasBinding"].valueChanges.subscribe(val => {
            if (val === true) {
                this.argument.toggleBinding(val);
                this.form.controls["valueFrom"].setValue(this.argument.valueFrom);
            } else if (val === false) {
                this.argument.toggleBinding(val);
                this.form.controls["primitive"].setValue(this.argument.primitive);
            }
        });

        this.tracked = this.form.valueChanges.subscribe(form => {

            if (this.argument.hasBinding) {
                this.argument.updateBinding({
                    position: form.position ? parseInt(form.position, 10) : 0,
                    separate: form.separate,
                    prefix: form.prefix,
                    shellQuote: form.shellQuote,
                    valueFrom: form.valueFrom.serialize && form.valueFrom.serialize()
                });
            } else {
                this.argument.updatePrimitive(form.primitive.serialize ? form.primitive.serialize() : form.primitive);
            }

            this.save.next(form);
        });
    }

    setDisabledState(isDisabled: boolean) {
        Object.keys(this.form.controls).forEach((item) => {
            const control = this.form.controls[item];
            isDisabled ? control.disable({onlySelf: true, emitEvent: false})
                : control.enable({onlySelf: true, emitEvent: false});
        });
    }
}
