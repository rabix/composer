import {AfterViewInit, Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {CommandOutputParameterModel} from "cwlts/models";
import {noop} from "../../../../lib/utils.lib";
import {ParameterTypeModel, CommandLineToolModel} from "cwlts/models";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-basic-output-section",
    styleUrls: ["./basic-output-section.component.scss"],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => BasicOutputSectionComponent), multi: true},
        {provide: NG_VALIDATORS, useExisting: forwardRef(() => BasicOutputSectionComponent), multi: true}
    ],
    template: `
        <form class="basic-output-section">

            <!-- Required -->
            <div class="form-group flex-container">
                <label class="form-control-label">Required</label>
                <span class="align-right">
                        <ct-toggle-slider [formControl]="form.controls['isRequired']"
                                          [on]="'Yes'"
                                          [off]="'No'"
                                          [readonly]="readonly">
                        </ct-toggle-slider>
                    </span>
            </div>

            <!--ID-->
            <div class="form-group" [class.has-danger]="form.controls['id'].errors">
                <label class="form-control-label">ID</label>
                <input type="text" class="form-control"
                       [formControl]="form.controls['id']">
                <div *ngIf="form.controls['id'].errors" class="form-control-feedback">
                    {{form.controls['id'].errors['error']}}
                </div>
            </div>

            <!--Input Type -->
            <div class="form-group">
                <ct-type-select [formControl]="form.controls['type']"></ct-type-select>
            </div>

            <!--Symbols-->
            <div class="form-group"
                 *ngIf="isType('enum')">
                <label>Symbols</label>
                <ct-auto-complete [create]="true"
                                  [formControl]="form.controls['symbols']"
                                  [readonly]="readonly"></ct-auto-complete>
            </div>

            <!--Glob-->
            <div class="form-group">
                <label class="form-control-label">Glob</label>
                <ct-expression-input [context]="context"
                                     [formControl]="form.controls['glob']"
                                     [readonly]="readonly">
                </ct-expression-input>
            </div>

        </form>

    `
})
export class BasicOutputSectionComponent extends DirectiveBase implements ControlValueAccessor, AfterViewInit {

    @Input()
    public readonly = false;

    /** Context in which expression should be evaluated */
    public context: { $job?: any, $self?: any } = {};

    @Input()
    public model: CommandLineToolModel;

    /** The currently displayed property */
    private output: CommandOutputParameterModel;

    public form: FormGroup;

    private onTouched = noop;

    private propagateChange = noop;

    private initSymbolsList: string[] = [];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(output: CommandOutputParameterModel): void {

        this.output = output;

        this.context = this.model.getContext(this.output);

        this.form = this.formBuilder.group({
            id: [{value: this.output.id, disabled: this.readonly}],
            type: [{value: this.output.type, disabled: this.readonly}, [Validators.required]],
            glob: [this.output.outputBinding.glob],
            isRequired: [!this.output.type.isNullable],
            itemType: [!!this.output.type.items ? this.output.type.items : "File"],
            symbols: [!!this.output.type.symbols ? this.output.type.symbols : this.initSymbolsList]
        });

        this.listenToTypeFormChanges();

        this.tracked = this.form.valueChanges.subscribe(value => {
            this.output.type.isNullable = !value.isRequired;

            if (value.symbols && this.isType("enum")) {
                this.output.type.symbols = value.symbols;
            }

            if (value.glob) {
                this.output.outputBinding.glob.setValue(value.glob.serialize(), value.glob.type);
                this.checkGlob();
            }

            if (value.id !== undefined && this.output.id !== value.id) {
                try {
                    this.model.changeIOId(this.output, value.id);

                    if (this.isType("enum") || this.isType("record")) {
                        this.output.type.name = value.id;
                    }
                } catch (ex) {
                    this.form.controls["id"].setErrors({error: ex.message});
                }
            }

            this.propagateChange(this.output);
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    validate() {
        return this.form.valid ? null : {error: "Basic output section is not valid."};
    }

    private listenToTypeFormChanges(): void {
        this.tracked = this.form.controls["type"].valueChanges.subscribe((value: ParameterTypeModel) => {

            if (this.isType("enum") || this.isType("record")) {
                this.output.type.name = this.output.id;
            }
        });
    }

    private checkGlob() {
        // add warning about empty glob if glob is empty
        if (this.output.outputBinding.glob && this.output.outputBinding.glob.serialize() === undefined) {
            this.output.outputBinding.glob.updateValidity({
                [this.output.outputBinding.glob.loc]: {
                    message: "Glob should be specified",
                    type: "warning"
                }
            }, true);
        } else if (this.output.outputBinding.glob &&
            // remove warning about empty glob if glob isn't empty and that warning exists
            this.output.outputBinding.warnings.length === 1 &&
            this.output.outputBinding.warnings[0].message === "Glob should be specified") {
            this.output.outputBinding.glob.cleanValidity();
        }
    }

    isType(type: string): boolean {
        return this.output.type.type === type || this.output.type.items === type;
    }

    ngAfterViewInit() {
        // checking after view init because loading expression model will clear its validity based on the provided context
        // wrapping it in a set timeout to avoid ExpressionChangedAfterItWasChecked
        // @fixme
        setTimeout(() => {
            this.checkGlob();
        });
    }
}
