import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {CommandLineToolModel, CommandOutputParameterModel} from "cwlts/models";
import {noop} from "../../../../lib/utils.lib";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";
import {ErrorCode} from "cwlts/models/helpers/validation";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-output-eval",
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => OutputEvalSectionComponent), multi: true}
    ],
    template: `
        <ct-form-panel class="borderless" [collapsed]="true">
            <div class="tc-header">Output eval</div>
            <div class="tc-body" *ngIf="output && outputEvalFormGroup">

                <!--Output eval-->
                <div class="form-group">
                    <label class="form-control-label">Output eval</label>
                    <ct-expression-input [disableLiteralTextInput]="true"
                                         [readonly]="readonly"
                                         [context]="context"
                                         [formControl]="outputEvalFormGroup.controls['outputEval']">
                    </ct-expression-input>
                </div>

                <!--Load Content-->
                <div class="form-group flex-container">
                    <label class="form-control-label">Load Content</label>
                    <span class="align-right">
                        <ct-toggle-slider [formControl]="outputEvalFormGroup.controls['loadContents']"
                                          [on]="'Yes'"
                                          [off]="'No'">
                        </ct-toggle-slider>
                    </span>
                </div>

                <div class="secondary-text">
                    Read up to the first 64 KiB of text from the file and place it in the "contents"
                    field of the file object for manipulation by expressions.
                </div>

            </div>
            <!--tc-body-->
        </ct-form-panel>
    `
})

export class OutputEvalSectionComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    public model: CommandLineToolModel;

    /** Context in which expression should be evaluated */
    public context: any = {};

    public output: CommandOutputParameterModel;

    private onTouched = noop;

    private propagateChange = noop;

    private readonly = false;

    outputEvalFormGroup: FormGroup;

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(output: CommandOutputParameterModel): void {
        this.output = output;

        this.context = this.model.getContext(this.output);

        this.outputEvalFormGroup = this.formBuilder.group({
            loadContents: [this.output.outputBinding.loadContents],
            outputEval: [this.output.outputBinding.outputEval]
        });

        this.tracked = this.outputEvalFormGroup.valueChanges
            .distinctUntilChanged()
            .subscribe(value => {
                this.output.outputBinding.outputEval.clearIssue(ErrorCode.OUTPUT_EVAL_INHERIT);
                this.output.outputBinding.loadContents = value.loadContents;
                this.propagateChange(this.output);

            });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.readonly = isDisabled;
        isDisabled ? this.outputEvalFormGroup.controls["loadContents"].disable() : this.outputEvalFormGroup.controls["loadContents"].enable();
    }
}
