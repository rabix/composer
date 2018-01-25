import {
    AfterViewInit, ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, OnChanges, OnInit, Output,
    SimpleChanges
} from "@angular/core";
import {
    AbstractControl, ControlValueAccessor, FormControl, FormGroup,
    NG_VALUE_ACCESSOR
} from "@angular/forms";
import {WorkflowModel, WorkflowStepInputModel} from "cwlts/models";
import {WorkflowInputParameterModel} from "cwlts/models/generic/WorkflowInputParameterModel";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {InputParameterModel} from "cwlts/models/generic/InputParameterModel";
import {NativeSystemService} from "../../../native/system/native-system.service";

@Component({
    selector: "ct-job-step-inspector",
    styleUrls: ["../../../workflow-editor/object-inspector/step-inspector/step-inputs-inspector/step-inputs-inspector.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./job-step-inspector.component.html",
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => JobStepInspectorComponent),
        multi: true
    }]

})
export class JobStepInspectorComponent extends DirectiveBase implements OnInit, OnChanges, AfterViewInit, ControlValueAccessor {

    @Input() readonly = false;

    @Input() workflowModel: WorkflowModel;

    @Input() stepInputs: Array<WorkflowInputParameterModel | WorkflowStepInputModel> = [];

    @Output() change = new EventEmitter();

    group = [];

    jobGroup = new FormGroup({});

    inputGroups: { name: string, inputs: WorkflowStepInputModel[] }[] = [];

    private propagateTouch: any;

    private propagateChange: any;

    private jobValue: Object;

    constructor(private native: NativeSystemService) {
        super();
    }

    writeValue(jobValue: any): void {

        this.jobValue = jobValue;
        this.jobGroup.patchValue(jobValue, {emitEvent: false});

        for (const controlName in this.jobGroup.controls) {

            const control = this.jobGroup.get(controlName);
            const kval    = this.jobValue[controlName];

            if (kval === null || kval === undefined) {
                control.disable({emitEvent: false, onlySelf: true});
            } else {
                control.enable({emitEvent: false, onlySelf: true});
            }
        }

    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.propagateTouch = fn;
    }


    ngAfterViewInit(): void {
        super.ngAfterViewInit();

        this.jobGroup.valueChanges
            .map(changes => {
                const out = {...this.jobValue, ...changes};

                for (const cname in this.jobGroup.controls) {
                    if (this.jobGroup.controls[cname].disabled) {
                        out[cname] = null;
                    }
                }

                return out;
            })
            .subscribeTracked(this, changes => this.propagateChange(changes));
    }

    /**
     * Executes when step get edited in the top-level forms.
     */
    onInputsFormChange(event: Event) {

        event.stopPropagation();

        const formField = event.target as HTMLInputElement;

        // Get field path (for an example -> "inputId.[0].record.[2]")
        const fieldPath = formField.getAttribute("prefix");

        // Get input type (number, text...)
        const type = formField.getAttribute("type");

        // Get field type (int, float, string, map ...)
        const fieldType = formField.getAttribute("fieldType");

        // Get field value
        const fieldValue = formField.value;

        // Get the new value that we should set the job to
        let val = fieldValue as any;
        if (type === "number") {
            val = fieldType === "int" ? parseInt(fieldValue, 10) : parseFloat(fieldValue);
        }

        // Form field might not have prefix, so if we missed it,
        // it's better to do nothing than break the app.
        if (!fieldPath) {
            return;
        }

        // Put "default" in prefix (inputId.[0].record.[2] -> inputId.default.[0].record.[2])
        const prefixSplit = fieldPath.split(".");
        prefixSplit.splice(1, 0, "default");
        const newPrefix = prefixSplit.join(".");

        // Dispatch it as an update to the step
        this.stepValueUpdate(newPrefix, val);
    }

    /**
     * Updates the step value for a given input
     */
    stepValueUpdate(prefix, value) {

        // Get top level id from prefix
        const inputId = prefix.split(".")[0];
        const input   = this.stepInputs.find(i => i.id === inputId);

        this.change.emit({
            input,
            value
        });
    }

    ngOnInit() {
    }

    ngOnChanges(changes: SimpleChanges) {

        // I have no idea why step input checking works
        if (changes.stepInputs && !this.stepInputsAreSame(changes.stepInputs.previousValue, changes.stepInputs.currentValue)) {

            this.recreateForms();

            if (this.jobValue) {
                this.jobGroup.patchValue(this.jobValue, {emitEvent: false});
            }
        }
    }

    isType(input: WorkflowInputParameterModel | WorkflowStepInputModel, types: string | string[]): boolean {
        if (typeof types === "string") {
            types = [types];
        }

        return !!types.find(type => {
            return input.type.type === type || input.type.items === type;
        });
    }

    clear(inputControl: AbstractControl) {
        inputControl.disable();
        inputControl.setValue(null);
    }

    private recreateForms(): void {

        for (let ctrl in this.jobGroup.controls) {
            this.jobGroup.removeControl(ctrl);
        }

        this.jobGroup = new FormGroup({});

        const grouped = {};

        for (const input of this.stepInputs) {

            const group = this.isType(input, "File") ? "Files" : "App Parameters";

            if (!grouped[group]) {
                grouped[group] = [];
            }

            grouped[group].push(input);

            const control = new FormControl();
            this.jobGroup.addControl(input.id, control);

            if (input.type.type === "array") {
                control.setValue([], {emitEvent: false});
            } else if (input.type.type === "record") {
                control.setValue({}, {emitEvent: false});
            }

        }

        // Order groups
        this.inputGroups = Object.keys(grouped).sort((a, b) => b.localeCompare(a)).map(key => ({
            name: key,
            inputs: grouped[key]
        }));

    }

    private stepInputsAreSame(previousValue: any[], currentValue: any[]) {
        if (previousValue === currentValue) {
            return true;
        }

        if (previousValue === undefined && currentValue !== undefined) {
            return false;
        }

        if (previousValue !== undefined && currentValue === undefined) {
            return false;
        }

        if (previousValue.length === 0 && currentValue.length === 0) {
            return true;
        }

        if (previousValue.length !== currentValue.length) {
            return false;
        }

        for (let i = 0; i < previousValue.length; i++) {
            if (previousValue[i] !== currentValue[i]) {
                return false;
            }
        }

        return true;

    }

    enableEditing(input: InputParameterModel): void {

        const inputFormField = this.jobGroup.get(input.id);
        inputFormField.enable({onlySelf: true});


        let value;

        const isArray = input.type.type === "array";
        const type = input.type.items || input.type.type;

        switch (type) {
            case "record":
                value = {};
                break;
            case "string":
                value = "";
                break;
            case "int":
            case "float":
                value = 0;
                break;
            case "boolean":
                value = false;
                break;
            case "File":
            case "Directory":

                const properties = [] as any;
                properties.push(type === "File" ? "openFile" : "openDirectory");

                if (isArray) {
                    properties.push("multiSelections");
                }

                this.native.openFileChoiceDialog({properties}).then(filePaths => {
                    const fileValues = filePaths.map(p => ({class: type, path: p}));

                    const value = !(isArray) ? fileValues[0] : fileValues;
                    inputFormField.setValue(value);

                }, err => {
                });

                return;
            default:
                value = null;
                break;
        }

        inputFormField.setValue(input.type.type === "array" ? [value] : value);
    }
}
