import {Component, forwardRef, Input} from "@angular/core";
import {
    ControlValueAccessor,
    FormBuilder,
    FormGroup,
    NG_VALUE_ACCESSOR,
    Validators
} from "@angular/forms";
import {CommandInputParameterModel} from "cwlts/models";
import {noop} from "../../../../lib/utils.lib";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    selector: "ct-input-binding-section",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => InputBindingSectionComponent),
            multi: true
        }
    ],

    template: `
        <div class="form-group" *ngIf="form && propertyType">

            <div class="form-group" *ngIf="!isType('record')">
                <label class="form-control-label">Value</label>
                <ct-expression-input
                        [context]="context"
                        [readonly]="readonly"
                        [formControl]="form.controls['valueFrom']"
                        [disableLiteralTextInput]="true">
                </ct-expression-input>
            </div>

            <div class="form-group">
                <label class="form-control-label">Position</label>
                <input class="form-control"
                       type="number"
                       [ct-disabled]="readonly"
                       [formControl]="form.controls['position']"/>
            </div>

            <div class="form-group">
                <label class="form-control-label">Prefix</label>
                <input class="form-control"
                       [ct-disabled]="isType('record') || readonly"
                       [formControl]="form.controls['prefix']"/>
            </div>

            <div class="form-group">
                <label>Separate value and prefix</label>
                <span class="pull-right">
                    <ct-toggle-slider
                            [ct-disabled]="isType('record') || readonly"
                            [formControl]="form.controls['separate']"
                            [readonly]="readonly"></ct-toggle-slider>
                </span>
            </div>

            <div class="form-group" *ngIf="propertyType === 'array'">
                <label class="form-control-label">Item Separator</label>
                <select class="form-control"
                        [ct-disabled]="isType('record')"
                        [formControl]="form.controls['itemSeparator']">
                    <option *ngFor="let itemSeparator of itemSeparators"
                            [value]="itemSeparator.value">
                        {{itemSeparator.text}}
                    </option>
                </select>
            </div>

            <div class="form-group" *ngIf="input.inputBinding.hasShellQuote">
                <label>shellQuote</label>
                <span class="pull-right">
                    <ct-toggle-slider [formControl]="form.controls['shellQuote']"></ct-toggle-slider>
                </span>
            </div>

            <ct-stage-input *ngIf="isType('record') || isType('File') && form.controls['stageInput']"
                            [formControl]="form.controls['stageInput']"
                            [readonly]="readonly">
            </ct-stage-input>
        </div>
    `
})
export class InputBindingSectionComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    readonly = false;

    /** The type of the property as an input, so we can react to changes in the component */
    @Input()
    propertyType: string;

    @Input()
    context: { $job?: any, $self?: any } = {};

    input: CommandInputParameterModel;

    form: FormGroup;

    private onTouched = noop;

    private propagateChange = noop;

    itemSeparators: { text: string, value: string }[] = [
        {text: "equal", value: "="},
        {text: "comma", value: ","},
        {text: "semicolon", value: ";"},
        {text: "space", value: " "},
        {text: "repeat", value: null}
    ];

    constructor(private formBuilder: FormBuilder) {
        super();
    }

    writeValue(input: CommandInputParameterModel): void {
        this.input = input;

        if (!!this.input.inputBinding) {
            this.createInputBindingForm(this.input);
        }
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    createInputBindingForm(input: CommandInputParameterModel): void {
        this.form = this.formBuilder.group({
            stageInput: [input],
            valueFrom: [input.inputBinding.valueFrom, [Validators.required]],
            position: [input.inputBinding.position, [Validators.pattern(/^\d+$/)]],
            prefix: [input.inputBinding.prefix],
            separate: [input.inputBinding.separate !== false],
            itemSeparator: [!!input.inputBinding.itemSeparator ? input.inputBinding.itemSeparator : null],
            shellQuote: [input.inputBinding.shellQuote]
        }, {onlySelf: true});

        if (!this.readonly) {
            this.listenToInputBindingFormChanges();
        }
    }

    listenToInputBindingFormChanges(): void {
        this.tracked = this.form.valueChanges
            .distinctUntilChanged()
            .debounceTime(300)
            .subscribe(form => {
                if (form.position !== undefined) {
                    this.input.inputBinding.position = parseInt(form.position, 10) || 0;
                }

                if (form.prefix !== undefined) {
                    this.input.inputBinding.prefix = form.prefix;
                }

                if (form.separate !== undefined) {
                    this.input.inputBinding.separate = form.separate;
                }

                if (form.itemSeparator !== undefined) {
                    this.input.inputBinding.itemSeparator = form.itemSeparator;
                }

                if (form.valueFrom !== undefined && form.valueFrom.serialize() === undefined) {
                    this.input.inputBinding.valueFrom.setValue("", "string");
                }

                if (form.loadContents !== undefined) {
                    this.input.inputBinding.loadContents = form.loadContents;
                }

                if (form.shellQuote !== undefined) {
                    this.input.inputBinding.shellQuote = form.shellQuote;
                }

                this.propagateChange(this.input);
            });
    }

    isType(type) {
        return this.propertyType === type || this.input.type.items === type;
    }
}
