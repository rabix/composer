import {
    AfterViewInit,
    ChangeDetectionStrategy, ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Input,
    OnChanges,
    QueryList,
    SimpleChanges,
    ViewChild,
    ViewChildren
} from "@angular/core";
import {AbstractControl, ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {InputParameterModel} from "cwlts/models/generic/InputParameterModel";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    selector: "ct-step-inspector-entry-2",
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./step-inspector-entry.component.html",
    styleUrls: ["./step-inspector-entry.component.scss"],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => StepInspectorEntry2Component),
        multi: true
    }]
})
export class StepInspectorEntry2Component extends DirectiveBase implements OnChanges, AfterViewInit, ControlValueAccessor {

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

    @ViewChildren("arrayItem", {read: StepInspectorEntry2Component})
    private arrayElements: QueryList<StepInspectorEntry2Component>;

    @ViewChild("input", {read: ElementRef})

    private inputElement: ElementRef;

    private propagateTouch: any;

    private propagateChange: any;

    private control: AbstractControl;

    constructor(private cdr: ChangeDetectorRef){
        super();
    }

    writeValue(value: any): void {

        if (value === undefined) {
            return;
        }

        this.warning = undefined;
        let update   = value;

        switch (this.inputType) {

            case "record":
                update = value instanceof Object ? value : {} as InputParameterModel;
                this.control.patchValue(update);
                break;

            case "array":
                if (this.inputType === "array" && !Array.isArray(value)) {
                    update = [];
                }
                this.patchArrayValue(update);
                break;

            case "Directory":
            case "File":

                update = value || {};

                this.control.setValue({class: this.inputType, path: update.path || ""}, {emitEvent: false});
                break;

            default:
                this.control.setValue(update, {emitEvent: false});
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

            if (plainInputTypes.indexOf(this.inputArrayItemsType) !== -1) {
                list.last.focus();
            }
        });

        this.control.valueChanges.subscribeTracked(this, change => {
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
                this.control.disable({emitEvent: false});
            } else {
                this.control.enable({emitEvent: false});
            }

        }
    }

    addArrayEntry(): void {
        this.warning = undefined;

        let newControl: AbstractControl;
        switch (this.inputArrayItemsType) {

            case "array":
                newControl = new FormArray([]);
                break;
            case "record":
                newControl = new FormGroup({});
                break;
            case "string":
                newControl = new FormControl("");
                break;
            case "File":
                newControl = new FormControl({
                    class: "File",
                    path: ""
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
        switch (this.inputType) {

            case "array":
                this.control = new FormArray([]);
                break;

            case "record":

                const controls = {};
                for (const field of this.inputRecordFields) {
                    controls[field.id] = new FormControl({value: undefined, disabled: this.readonly});
                }

                this.control = new FormGroup(controls);
                break;

            case "File":

                this.control = new FormGroup({
                    class: new FormControl("File"),
                    path: new FormControl({value: undefined, disabled: this.readonly})
                });
                break;

            case "Directory":

                this.control = new FormGroup({
                    class: new FormControl("Directory"),
                    path: new FormControl({value: undefined, disabled: this.readonly})
                });

                break;

            default:
                this.control = new FormControl();
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
}
