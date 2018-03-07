import {AfterViewInit, Component, forwardRef, Inject, Input, QueryList, ViewChildren} from "@angular/core";
import {ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators} from "@angular/forms";
import {CommandInputParameterModel, CommandLineToolModel} from "cwlts/models";
import {noop} from "../../../../lib/utils.lib";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";
import {ToggleSliderComponent} from "../../../../ui/toggle-slider/toggle-slider.component";
import {ModalService} from "../../../../ui/modal/modal.service";
import {merge} from "rxjs/observable/merge";
import {of} from "rxjs/observable/of";
import {map, distinctUntilChanged, filter, take} from "rxjs/operators";
import {AppMetaManagerToken} from "../../../../core/app-meta/app-meta-manager-factory";
import {AppMetaManager} from "../../../../core/app-meta/app-meta-manager";

@Component({
    selector: "ct-basic-input-section",
    styleUrls: ["./basic-input-section.component.scss"],
    templateUrl: "./basic-input-section.component.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => BasicInputSectionComponent),
        multi: true
    }],
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

    constructor(private formBuilder: FormBuilder,
                private modal: ModalService,
                @Inject(AppMetaManagerToken) private appMetaManager: AppMetaManager) {
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

                    const oldId = this.input.id;

                    this.model.changeIOId(this.input, value);

                    if (this.isType("enum") || this.isType("record")) {
                        this.input.type.name = value;
                    }

                    // If input id is changed we should migrate related job key
                    this.appMetaManager.getAppMeta("job").pipe(take(1)).subscribe((job) => {

                        const jobValue = job[oldId];

                        delete job[oldId];

                        job[value] = jobValue;

                        this.appMetaManager.patchAppMeta("job", job);

                    });

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

            // If type is changed nullify job value for that input
            this.appMetaManager.getAppMeta("job").pipe(take(1)).subscribe((job) => {

                job[this.input.id] = null;

                this.appMetaManager.patchAppMeta("job", job);

            });

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
                    content: `Turning this option off might cause you to lose some of the values for your inputs.\nDo you want to proceed ?`
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
        merge(
            of(this.includeInCommandLine.length),
            this.includeInCommandLine.changes.pipe(
                map(l => l.length)
            )
        ).pipe(
            distinctUntilChanged(),
            filter(a => !!a)
        ).subscribeTracked(this, () => {
            this.addIncludeInCommandLineToggleDecorator();
        });
    }
}
