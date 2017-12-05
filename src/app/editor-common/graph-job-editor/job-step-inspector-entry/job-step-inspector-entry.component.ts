import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Input, OnChanges, QueryList,
    SimpleChanges, ViewChild, ViewChildren
} from "@angular/core";
import {AbstractControl, ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {InputParameterModel} from "cwlts/models/generic/InputParameterModel";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {JobFileMetadataModalComponent} from "../job-file-metadata-modal/job-file-metadata-modal.component";

@Component({
    selector: "ct-job-step-inspector-entry",
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./job-step-inspector-entry.component.html",
    styleUrls: ["./job-step-inspector-entry.component.scss"],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => JobStepInspectorEntryComponent),
        multi: true
    }]
})
export class JobStepInspectorEntryComponent extends DirectiveBase implements OnChanges, AfterViewInit, ControlValueAccessor {

    @Input() readonly = false;

    @Input() inputType: string;

    @Input() inputArrayItemsType: string;

    @Input() inputEnumSymbols: string[];

    @Input() inputRecordFields: InputParameterModel[];

    /**
     * We might want to show a warning next to a field.
     * This can happen for example if we encounter a mismatch between step value and the input type,
     * for example, an input can by File[], and the step value can be just a plain string.
     */
    warning: string;

    @ViewChildren("arrayItem", {read: JobStepInspectorEntryComponent})
    private arrayElements: QueryList<JobStepInspectorEntryComponent>;

    @ViewChild("input", {read: ElementRef})

    private inputElement: ElementRef;

    private propagateTouch: any;

    private propagateChange: any;

    private control: AbstractControl;

    constructor(private cdr: ChangeDetectorRef, private modal: ModalService) {
        super();
    }

    writeValue(value: any): void {

        if (value === undefined) {
            return;
        }

        const updateOptions = {emitEvent: false};
        this.warning        = undefined;

        let update = value;
        switch (this.inputType) {

            case "record":

                update = value instanceof Object ? value : {} as InputParameterModel;
                this.control.patchValue(update, updateOptions);
                break;

            case "array":

                if (this.inputType === "array" && !Array.isArray(value)) {
                    this.patchArrayValue([]);
                } else {
                    this.patchArrayValue(update);
                }

                break;

            case "string":
                this.control.setValue(update ? String(update) : "", updateOptions);
                break;

            case "float":
            case "int":
                this.control.setValue(~~update, updateOptions);
                break;
            case "boolean":
                this.control.setValue(Boolean(update), updateOptions);
                break;

            case "Directory":
            case "File":

                update = value || {};
                this.control.setValue({
                    class: this.inputType,
                    path: update.path || "",
                    secondaryFiles: Array.isArray(update.secondaryFiles) || [],
                    metadata: Object.prototype.isPrototypeOf(update.metadata) || {}
                }, updateOptions);
                break;

            default:
                this.control.setValue(update, updateOptions);
                break;

        }

        this.cdr.markForCheck();

    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.propagateTouch = fn;
    }

    ngAfterViewInit() {

        this.arrayElements.changes.subscribeTracked(this, list => {

            const plainInputTypes = ["boolean", "float", "int", "string", "enum"];

            if (plainInputTypes.indexOf(this.inputArrayItemsType) !== -1 && list.last) {
                list.last.focus();
            }
        });

        this.control.valueChanges
            .filter(v => this.control.status !== "DISABLED")
            .subscribeTracked(this, change => {

                let typecheckedChange = change;

                if (this.inputType === "int") {
                    typecheckedChange = ~~change;
                } else if (this.inputType === "float") {
                    typecheckedChange = isNaN(change) ? 0 : parseFloat(change);
                }

                this.propagateChange(typecheckedChange);
            });
    }


    /**
     * Whenever our inputs change, we should recreate form controls for this component
     */
    ngOnChanges(changes: SimpleChanges): void {

        if (changes.inputType) {
            this.setupFormControls();
        }

        if (changes.readonly) {
            if (this.readonly) {
                this.control.disable({onlySelf: true, emitEvent: false});
            } else {
                this.control.enable({onlySelf: true, emitEvent: false});
            }

        }
    }

    clear() {
        this.control.setValue(null);
    }

    addArrayEntry(): void {
        this.warning = undefined;

        let newControl: AbstractControl;
        switch (this.inputArrayItemsType) {

            case "array":
                newControl = new FormArray([]);
                break;
            case "record":
                newControl = new FormControl({});
                break;
            case "string":
                newControl = new FormControl("");
                break;
            case "int":
            case "float":
                newControl = new FormControl(0);
                break;
            case "boolean":
                newControl = new FormControl(false);
                break;
            case "Directory":
                newControl = new FormControl({
                    class: "Directory",
                    path: ""
                });
                break;
            case "File":
                newControl = new FormControl({
                    path: "",
                    class: "File",
                    metadata: {},
                    secondaryFiles: [],

                });
                break;
            default:
                newControl = new FormControl();
                break;
        }

        (this.control as FormArray).push(newControl);
    }

    deleteFromArray(index: number, control = this.control as FormArray): void {
        control.removeAt(index);
    }

    focus(): void {
        this.inputElement.nativeElement.focus();
    }

    private setupFormControls(): void {

        const disabled = this.readonly;

        switch (this.inputType) {

            case "array":
                this.control = new FormArray([]);
                disabled ? this.control.disable() : this.control.enable();
                break;

            case "record":

                const controls = {};
                for (const field of this.inputRecordFields) {
                    controls[field.id] = new FormControl({value: undefined, disabled});
                }

                this.control = new FormGroup(controls);
                break;

            case "File":

                this.control = new FormGroup({
                    path: new FormControl({value: undefined, disabled}),
                    class: new FormControl({value: "File", disabled}),
                    metadata: new FormControl({value: {}, disabled}),
                    secondaryFiles: new FormControl({value: [], disabled}),
                });
                break;

            case "Directory":

                this.control = new FormGroup({
                    class: new FormControl("Directory"),
                    path: new FormControl({value: undefined, disabled})
                });

                break;

            default:
                this.control = new FormControl();
                disabled ? this.control.disable() : this.control.enable();
                break;
        }
    }

    private patchArrayValue(update: any[], control = this.control as FormArray) {

        while (control.length !== update.length) {
            if (update.length < control.length) {
                this.deleteFromArray(control.length - 1);
            } else if (update.length > control.length) {
                this.addArrayEntry();
            }
        }

        control.patchValue(update);
    }


    setDisabledState(isDisabled: boolean): void {

        if (isDisabled && this.control.enabled) {
            this.control.disable();
        } else if (!isDisabled && this.control.disabled) {
            this.control.enable();
        }

        this.cdr.markForCheck();
    }

    promptFileMetadata() {
        const comp          = this.modal.fromComponent(JobFileMetadataModalComponent, "Secondary files and metadata");
        comp.secondaryFiles = ["first", "second", "third"];
        comp.submit.take(1).subscribeTracked(this, (data) => {
            console.log("Received data", data);
        })
    }
}
