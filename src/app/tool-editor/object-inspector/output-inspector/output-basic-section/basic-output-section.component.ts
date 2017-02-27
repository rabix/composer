import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {CommandOutputParameterModel as OutputProperty} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../../components/common/component-base";
import {noop} from "../../../../lib/utils.lib";
import {OutputParameterTypeModel} from "cwlts/models";

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
                        <ct-toggle-slider [formControl]="basicSectionForm.controls['isRequired']"
                                          [on]="'Yes'"
                                          [off]="'No'"
                                          [readonly]="readonly">
                        </ct-toggle-slider>
                    </span>
            </div>

            <!--ID-->
            <div class="form-group">
                <label class="form-control-label">ID</label>
                <input type="text" class="form-control" [formControl]="basicSectionForm.controls['propertyIdForm']">
            </div>

            <!--Input Type -->
            <div class="form-group">
                <input-type-select [formControl]="basicSectionForm.controls['typeForm']"></input-type-select>
            </div>

            <!--Symbols-->
            <symbols-section class="form-group"
                             *ngIf="isEnumType()"
                             [formControl]="basicSectionForm.controls['symbols']">
            </symbols-section>

            <!--Glob-->
            <div class="form-group">
                <label class="form-control-label">Glob</label>
                <ct-expression-input [context]="context"
                                     [formControl]="basicSectionForm.controls['glob']"
                                     [readonly]="readonly">
                </ct-expression-input>
            </div>

        </form>

    `
})
export class BasicOutputSectionComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public readonly = false;

    @Input()
    public context: { $job?: any, $self?: any } = {};

    /** The currently displayed property */
    private output: OutputProperty;

    private basicSectionForm: FormGroup;

    private onTouched = noop;

    private propagateChange = noop;

    private initSymbolsList: string[] = [];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(output: OutputProperty): void {

        this.output = output;

        this.basicSectionForm = this.formBuilder.group({
            propertyIdForm: [{value: this.output.id, disabled: this.readonly}],
            typeForm: [{value: this.output.type, disabled: this.readonly}, [Validators.required]],
            glob: [this.output.outputBinding.glob],
            isRequired: [!this.output.type.isNullable],
            itemType: [!!this.output.type.items ? this.output.type.items : "File"],
            symbols: [!!this.output.type.symbols ? this.output.type.symbols : this.initSymbolsList]
        });

        this.listenToTypeFormChanges();
        this.listenToIdChanges();

        this.tracked = this.basicSectionForm.valueChanges.subscribe(value => {
            this.output.type.isNullable = !value.isRequired;
            this.output.outputBinding.glob = value.glob;

            if (value.symbols.length > 0 && this.isEnumType()) {
                this.output.type.symbols = value.symbols;
            }

            this.output.validate();
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
        return this.basicSectionForm.valid ? null : {error: "Basic output section is not valid."}
    }

    private listenToIdChanges(): void {
        this.tracked = this.basicSectionForm.controls["propertyIdForm"].valueChanges
            .subscribe((id: string) => {
                this.output.id = id;
                if (this.isEnumType() || this.isRecordType()) {
                    this.output.type.name = id;
                }
            });
    }

    private listenToTypeFormChanges(): void {
        this.tracked = this.basicSectionForm.controls["typeForm"].valueChanges.subscribe((value: OutputParameterTypeModel) => {

            this.output.type.setType(value.type);

            if (this.isEnumType() || this.isRecordType()) {
                this.output.type.name = this.output.id;
            }
        });
    }

    private isRecordType() {
        return this.output.type.type === "record" || (this.output.type.type === "array" && this.output.type.items === "record");
    }

    private isEnumType() {
        return this.output.type.type === "enum" || (this.output.type.type === "array" && this.output.type.items === "enum");
    }
}
