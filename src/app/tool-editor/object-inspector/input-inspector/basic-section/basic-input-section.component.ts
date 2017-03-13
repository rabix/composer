import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {SBDraft2CommandInputParameterModel} from "cwlts/models/d2sb";
import {noop} from "../../../../lib/utils.lib";
import {InputParameterTypeModel} from "cwlts/models";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-basic-input-section",
    styleUrls: ["./basic-input-section.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => BasicInputSectionComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => BasicInputSectionComponent),
            multi: true
        }
    ],
    template: `
        <form class="ct-basic-input-section">

            <!--Required-->
            <div class="form-group flex-container">
                <label>Required</label>
                <span class="align-right">
                        <ct-toggle-slider [formControl]="basicSectionForm.controls['isRequired']"
                                          [off]="'No'"
                                          [on]="'Yes'"
                                          [readonly]="readonly">
                        </ct-toggle-slider>
                    </span>
            </div>

            <!--ID-->
            <div class="form-group">
                <label class="form-control-label">ID</label>
                <input type="text"
                       class="form-control"
                       [formControl]="basicSectionForm.controls['propertyIdForm']">
            </div>

            <!--Input Type -->
            <input-type-select [formControl]="basicSectionForm.controls['typeForm']"></input-type-select>

            <!--Symbols-->
            <symbols-section class="form-group"
                             *ngIf="isEnumType()"
                             [formControl]="basicSectionForm.controls['symbols']"
                             [readonly]="readonly">
            </symbols-section>

            <!--Include in command line -->
            <div class="form-group flex-container"
                 *ngIf="!isMapType() 
                                && basicSectionForm.controls['isBound']">

                <label>Include in command line</label>
                <span class="align-right">
                        <ct-toggle-slider [formControl]="basicSectionForm.controls['isBound']"
                                          [off]="'No'"
                                          [on]="'Yes'"
                                          [readonly]="readonly">
                        </ct-toggle-slider>
                    </span>
            </div>

            <!--Input Binding-->
            <input-binding-section *ngIf="input.isBound"
                                   [context]="context"
                                   [propertyType]="input.type.type"
                                   [readonly]="readonly"
                                   [formControl]="basicSectionForm.controls['inputBinding']">
            </input-binding-section>
        </form>
    `
})
export class BasicInputSectionComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    public context: { $job?: any, $self?: any } = {};

    @Input()
    public readonly = false;

    /** The currently displayed property */
    private input: SBDraft2CommandInputParameterModel;

    private basicSectionForm: FormGroup;

    private onTouched = noop;

    private propagateChange = noop;

    private initSymbolsList: string[] = [];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(input: SBDraft2CommandInputParameterModel): void {
        this.input = input;

        this.basicSectionForm = this.formBuilder.group({
            propertyIdForm: [{value: this.input.id, disabled: this.readonly}],
            typeForm: [{value: this.input.type, disabled: this.readonly}, [Validators.required]],
            isBound: [this.input.isBound],
            isRequired: [!this.input.type.isNullable],
            inputBinding: [this.input],
            symbols: [this.input.type.symbols ? this.input.type.symbols : this.initSymbolsList]
        });

        this.listenToIsBoundChanges();
        this.listenToInputBindingChanges();
        this.listenToTypeFormChanges();
        this.listenToIdChanges();

        this.tracked = this.basicSectionForm.valueChanges.subscribe(value => {
            this.input.type.isNullable = !value.isRequired;

            if (value.symbols.length > 0 && this.isEnumType()) {
                this.input.type.symbols = value.symbols;
            }

            this.input.validate();
            this.propagateChange(this.input);
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    validate() {
        return this.basicSectionForm.valid ? null : {error: "Basic input section is not valid."}
    }

    private listenToIsBoundChanges(): void {
        this.tracked = this.basicSectionForm.controls["isBound"].valueChanges.subscribe((isBound: boolean) => {
            if (isBound) {
                this.input.createInputBinding();
                this.basicSectionForm.setControl("inputBinding", new FormControl(this.input));
                this.listenToInputBindingChanges();
            } else {
                this.input.removeInputBinding();
                this.basicSectionForm.removeControl("inputBinding");
            }
        });
    }

    private listenToIdChanges(): void {
        this.tracked = this.basicSectionForm.controls["propertyIdForm"].valueChanges
            .subscribe((id: string) => {
                this.input.id = id;

                if (this.isEnumType() || this.isRecordType()) {
                    this.input.type.name = id;
                }
            });
    }

    private listenToInputBindingChanges(): void {
        this.tracked = this.basicSectionForm.controls["inputBinding"].valueChanges
            .subscribe((input: SBDraft2CommandInputParameterModel) => {
                this.input.updateInputBinding(input.inputBinding);
                Object.assign(this.input.customProps, input.customProps);
            });
    }

    private listenToTypeFormChanges(): void {
        this.tracked = this.basicSectionForm.controls["typeForm"].valueChanges
            .subscribe((value: InputParameterTypeModel) => {
                this.input.type.setType(value.type);

                if (value.type !== "array" && this.input.isBound) {
                    this.input.inputBinding.itemSeparator = undefined;
                }

                if (this.isMapType() && this.input.isBound) {

                    this.input.removeInputBinding();
                    this.basicSectionForm.controls["isBound"].setValue(this.input.isBound);
                }

                if (!!value.items && this.input.type.type === "array") {
                    this.input.type.items = value.items;
                }

                if (this.isEnumType() || this.isRecordType()) {
                    this.input.type.name = this.input.id;
                }

            });
    }

    private isEnumType() {
        return this.input.type.type === "enum" || (this.input.type.type === "array" && this.input.type.items === "enum");
    }

    private isMapType() {
        return this.input.type.type === "map" || (this.input.type.type === "array" && this.input.type.items === "map")
    }

    private isRecordType() {
        return this.input.type.type === "record" || (this.input.type.type === "array" && this.input.type.items === "record");
    }

}
