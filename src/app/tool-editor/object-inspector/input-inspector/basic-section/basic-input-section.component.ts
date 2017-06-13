import {Component, forwardRef, Input, ViewEncapsulation} from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALUE_ACCESSOR,
    Validators
} from "@angular/forms";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";
import {noop} from "../../../../lib/utils.lib";

@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-basic-input-section",
    styleUrls: ["./basic-input-section.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
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
                        <ct-toggle-slider [formControl]="form.controls['isRequired']"
                                          [readonly]="readonly">
                        </ct-toggle-slider>
                    </span>
            </div>

            <!--ID-->
            <div class="form-group" [class.has-danger]="form.controls['id'].errors">
                <label class="form-control-label">ID</label>
                <input type="text"
                       class="form-control"
                       [formControl]="form.controls['id']">
                <div *ngIf="form.controls['id'].errors" class="form-control-feedback">
                    {{form.controls['id'].errors['error']}}
                </div>
            </div>

            <!--Input Type -->
            <ct-input-type-select [formControl]="form.controls['type']"></ct-input-type-select>

            <!--Symbols-->
            <ct-symbols-section class="form-group"
                                *ngIf="isType('enum')"
                                [formControl]="form.controls['symbols']"
                                [readonly]="readonly">
            </ct-symbols-section>

            <!--Include in command line -->
            <div class="form-group flex-container"
                 *ngIf="!isType('map') && !!form.controls['isBound']">
                <label>Include in command line</label>
                <span class="align-right">
                        <ct-toggle-slider [formControl]="form.controls['isBound']"
                                          [readonly]="readonly">
                        </ct-toggle-slider>
                    </span>
            </div>

            <!--Input Binding-->
            <ct-input-binding-section *ngIf="input.isBound"
                                      [context]="context"
                                      [propertyType]="input.type.type"
                                      [readonly]="readonly"
                                      [formControl]="form.controls['inputBinding']">
            </ct-input-binding-section>


            <ct-secondary-file *ngIf="isType('File') && showSecondaryFiles()"
                               [context]="context"
                               [port]="input"
                               [bindingName]="'inputBinding'"
                               (update)="propagateChange(input)"
                               [readonly]="readonly">
            </ct-secondary-file>
        </form>
    `
})
export class BasicInputSectionComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    context: { $job?: any, $self?: any } = {};

    @Input()
    readonly = false;

    @Input()
    model: CommandLineToolModel;

    /** The currently displayed property */
    input: CommandInputParameterModel;

    form: FormGroup;

    private onTouched = noop;

    private propagateChange = noop;

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(input: CommandInputParameterModel): void {
        this.input = input;

        this.form = this.formBuilder.group({
            id: [{value: this.input.id, disabled: this.readonly}],
            type: [{value: this.input.type, disabled: this.readonly}, [Validators.required]],
            isBound: [this.input.isBound],
            isRequired: [!this.input.type.isNullable],
            inputBinding: [this.input],
            symbols: [this.input.type.symbols ? this.input.type.symbols : []]
        });

        // track separately because it causes changes to the rest of the form
        this.listenToIsBoundChanges();

        this.tracked = this.form.valueChanges.subscribe(value => {
            // nullable changes
            if (value.isRequired !== undefined) {
                this.input.type.isNullable = !value.isRequired;
            }

            // symbols changes
            if (value.symbols && this.isType("enum")) {
                this.input.type.symbols = value.symbols;
            }

            // id changes
            if (value.id !== undefined && this.input.id !== value.id) {
                try {
                    this.model.changeIOId(this.input, value.id);

                    if (this.isType("enum") || this.isType("record")) {
                        this.input.type.name = value.id;
                    }
                } catch (ex) {
                    this.form.controls["id"].setErrors({error: ex.message});
                }
            }

            // type changes
            if (value.type) {
                if (value.type.type !== "array" && this.input.isBound) {
                    this.input.inputBinding.itemSeparator = undefined;
                }

                if (this.isType("map") && this.input.isBound) {

                    this.input.removeInputBinding();
                    this.form.controls["isBound"].setValue(this.input.isBound);
                }

                if (this.isType("enum") || this.isType("record")) {
                    this.input.type.name = this.input.id;
                }
            }

            this.propagateChange(this.input);
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private listenToIsBoundChanges(): void {
        this.tracked = this.form.controls["isBound"].valueChanges.subscribe((isBound: boolean) => {
            if (isBound) {
                this.input.createInputBinding();
                this.form.setControl("inputBinding", new FormControl(this.input));
            } else {
                this.input.removeInputBinding();
                this.form.removeControl("inputBinding");
            }
        });
    }

    showSecondaryFiles(): boolean {
        return this.input.hasSecondaryFilesInRoot || !!this.input.inputBinding;
    }

    isType(type: string): boolean {
        return this.input.type.type === type || this.input.type.items === type;
    }
}
