import {Subject} from "rxjs";
import {Component, Input, Output, ViewEncapsulation} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {CommandArgumentModel} from "cwlts/models";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,
    selector: "ct-argument-inspector",
    template: `        
        <form [formGroup]="form">
            <div class="form-group">
                <label>CommandLineBinding</label>
                <ct-toggle-slider [formControl]="form.controls['hasBinding']"></ct-toggle-slider>
            </div>

            <div *ngIf="argument.hasBinding">
                <!--Prefix Field-->
                <div class="form-group">
                    <label class="form-control-label">Prefix</label>
                    <input type="text" class="form-control" [formControl]="form.controls['prefix']">
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

                <div class="form-group flex-container">
                    <label>Prefix and value separation</label>
                    <span class="align-right">
                        <ct-toggle-slider [formControl]="form.controls['separate']"
                                          [on]="'Separate'"
                                          [off]="'Join'"
                                          [readonly]="readonly">
                        </ct-toggle-slider>
                    </span>
                </div>

                <!--Position Field-->
                <div class="form-group">
                    <label class="form-control-label">Position</label>
                    <input type="number" class="form-control" [formControl]="form.controls['position']">
                </div>
            </div>
            
            <div *ngIf="!argument.hasBinding">
                <div class="form-group">
                    <label class="form-control-label">Value</label>
                    <input type="text" 
                           class="form-control" 
                           *ngIf="!argument.hasExprPrimitive"
                           [formControl]="form.controls['primitive']">
                    
                    <ct-expression-input type="string" 
                                         *ngIf="argument.hasExprPrimitive" 
                                         [formControl]="form.controls['primitive']">
                        
                    </ct-expression-input>
                </div>
            </div>

        </form>
    `
})
export class ArgumentInspector extends DirectiveBase {

    @Input()
    public readonly = false;

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
            hasBinding: new FormControl(this.argument.hasBinding),
            valueFrom: new FormControl(this.argument.valueFrom),
            separate: new FormControl(this.argument.separate !== false),
            position: new FormControl({value: this.argument.position || 0, disabled: this.readonly}),
            prefix: new FormControl({value: this.argument.prefix || "", disabled: this.readonly}),
            primitive: new FormControl({value: this.argument.primitive || "", disabled: this.readonly})
        });

        this.tracked = this.form.controls["hasBinding"].valueChanges.subscribe(val => {
            if (val === true) {
                this.argument.toggleBinding(val);
            } else if (val === false) {
                this.argument.toggleBinding(val);
            }
        });

        this.tracked = this.form.valueChanges.subscribe(form => {

            if (this.argument.hasBinding) {
                this.argument.updateBinding({
                    position: form.position,
                    separate: form.separate,
                    prefix: form.prefix,
                    valueFrom: form.valueFrom ? form.valueFrom.serialize() : ""
                });
            } else {
                this.argument.updatePrimitive(form.primitive.serialize ? form.primitive.serialize() : form.primitive);
            }

            this.save.next(form);
        });
    }
}
