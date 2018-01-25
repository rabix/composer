import {Observable} from "rxjs/Observable";
import {
    AfterViewInit, Component, forwardRef, Input, QueryList, ViewChild, ViewChildren, ViewEncapsulation
} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
import {noop} from "../../../../lib/utils.lib";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";
import {ToggleSliderComponent} from "../../../../ui/toggle-slider/toggle-slider.component";
import {ModalService} from "../../../../ui/modal/modal.service";

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
                        <ct-toggle-slider date-test="required-toggle" [formControl]="form.controls['isRequired']">
                        </ct-toggle-slider>
                    </span>
            </div>

            <!--ID-->
            <div class="form-group" [class.has-danger]="form.controls['id'].errors">
                <label class="form-control-label">ID</label>
                <input type="text"
                       class="form-control"
                       data-test="id-field"
                       [formControl]="form.controls['id']">
                <div *ngIf="form.controls['id'].errors" class="form-control-feedback">
                    {{form.controls['id'].errors['error']}}
                </div>
            </div>

            <!--Input Type -->
            <ct-type-select [formControl]="form.controls['type']"></ct-type-select>

            <!--Symbols-->
            <div class="form-group"
                 *ngIf="isType('enum')">
                <label>Symbols</label>
                <ct-auto-complete data-test="symbols-field"
                                  [create]="true"
                                  [formControl]="form.controls['symbols']"></ct-auto-complete>
            </div>

            <!--Include in command line -->
            <div class="form-group flex-container"
                 *ngIf="!isType('map') && !!form.controls['isBound']">
                <label>Include in command line</label>
                <span class="align-right">
                        <ct-toggle-slider data-test="cmd-line-toggle" [formControl]="form.controls['isBound']"
                                          #includeInCommandLine>
                        </ct-toggle-slider>
                    </span>
            </div>

            <!--Input Binding-->
            <ct-input-binding-section *ngIf="input.isBound"
                                      [context]="context"
                                      [propertyType]="input.type.type"
                                      [formControl]="form.controls['inputBinding']">
            </ct-input-binding-section>


            <ct-secondary-file *ngIf="isType('File') && showSecondaryFiles()"
                               [formControl]="form.controls['secondaryFiles']"
                               [readonly]="readonly"
                               [context]="context"
                               [port]="input"
                               [bindingName]="'inputBinding'"
                               (update)="propagateChange(input)">
            </ct-secondary-file>
        </form>
    `
})
export class BasicInputSectionComponent extends DirectiveBase implements ControlValueAccessor, AfterViewInit {

    @Input()
    context: { $job?: any, $self?: any } = {};

    @Input()
    readonly = false;

    @Input()
    model: CommandLineToolModel;

    @ViewChildren("includeInCommandLine")
    private includeInCommandLine: QueryList<ToggleSliderComponent>;

    /** The currently displayed property */
    input: CommandInputParameterModel;

    form: FormGroup;

    private onTouched = noop;

    private propagateChange = noop;

    constructor(private formBuilder: FormBuilder, private modal: ModalService) {
        super();
    }

    writeValue(input: CommandInputParameterModel): void {
        this.input = input;

        this.form = this.formBuilder.group({
            id: [{value: this.input.id, disabled: this.readonly}],
            type: [{value: this.input.type, disabled: this.readonly}, [Validators.required]],
            isBound: [{value: this.input.isBound, disabled: this.readonly}],
            isRequired: [{value: !this.input.type.isNullable, disabled: this.readonly}],
            inputBinding: [{value: this.input, disabled: this.readonly}],
            symbols: [{value: this.input.type.symbols ? this.input.type.symbols : [], disabled: this.readonly}],
            secondaryFiles: [{value: this.input.secondaryFiles, disabled: this.readonly}]
        });

        // track separately because it causes changes to the rest of the form
        this.listenToIsBoundChanges();

        this.form.controls["isRequired"].valueChanges.subscribeTracked(this, (value) => {

            this.input.type.isNullable = !value;

        });

        this.form.controls["symbols"].valueChanges.subscribeTracked(this, (value) => {

            this.input.type.symbols = value;

        });

        this.form.controls["id"].valueChanges.subscribeTracked(this, (value) => {

            if (this.input.id !== value) {
                try {
                    this.model.changeIOId(this.input, value);

                    if (this.isType("enum") || this.isType("record")) {
                        this.input.type.name = value;
                    }
                } catch (ex) {
                    this.form.controls["id"].setErrors({error: ex.message});
                }
            }

        });

        this.form.controls["type"].valueChanges.subscribeTracked(this, (value) => {

            if (!this.isType("File")) {
                this.input.updateSecondaryFiles([]);
                this.form.controls["secondaryFiles"].setValue([], {onlySelf: true, emitEvent: false});
                this.form.controls["secondaryFiles"].disable({onlySelf: true, emitEvent: false});
                delete this.input.customProps["sbg:stageInput"];
                if (this.input.inputBinding) {
                    this.input.inputBinding.loadContents = false;
                }
            } else {
                this.form.controls["secondaryFiles"].enable({onlySelf: true, emitEvent: false});
            }

            if (value.type !== "array" && this.input.isBound) {
                this.input.inputBinding.itemSeparator = undefined;
            }

            if (this.isType("map") && this.input.isBound) {

                this.input.removeInputBinding();
                this.form.controls["isBound"].setValue(this.input.isBound);
            }

            if (this.isType("enum") || this.isType("record")) {
                this.input.type.name = this.input.id;
            }

        });

        this.tracked = this.form.valueChanges.subscribe(() => {
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

    setDisabledState(isDisabled: boolean): void {
        this.readonly = isDisabled;
        Object.keys(this.form.controls).forEach((item) => {
            const control = this.form.controls[item];
            isDisabled ? control.disable({onlySelf: true, emitEvent: false})
                : control.enable({onlySelf: true, emitEvent: false});
        });
    }

    addIncludeInCommandLineToggleDecorator(): void {

        const toggleSlider = this.includeInCommandLine.first;

        const baseToggleFnc = toggleSlider.toggleCheck.bind(toggleSlider);

        const toggleFunctionDecorator = (event) => {

            // Show modal only in case when switching from on to off
            if (this.input.isBound) {
                event.preventDefault();

                this.modal.confirm({
                    content: `If you turn the "Include in command line" option off, you might loose some input values.\nDo you want to proceed ?`
                }).then(() => {
                    baseToggleFnc(event);
                }, () => {
                });
            } else {
                baseToggleFnc(event);
            }
        };

        toggleSlider.toggleCheck = toggleFunctionDecorator.bind(this);
    }

    ngAfterViewInit() {
        Observable.merge(Observable.of(this.includeInCommandLine.length), this.includeInCommandLine.changes.map(l => l.length))
            .distinctUntilChanged().filter(a => !!a)
            .subscribeTracked(this, () => {
                this.addIncludeInCommandLineToggleDecorator();
            });
    }
}
