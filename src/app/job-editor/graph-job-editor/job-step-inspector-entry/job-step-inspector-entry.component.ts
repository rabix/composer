import {
    AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, Inject, Injector, Input, OnChanges,
    QueryList,
    SimpleChanges, ViewChild, ViewChildren
} from "@angular/core";
import {AbstractControl, ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {InputParameterModel} from "cwlts/models/generic/InputParameterModel";
import {APP_MODEL} from "../../../core/factories/app-model-provider-factory";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";
import {JobFileMetadataModalComponent} from "../job-file-metadata-modal/job-file-metadata-modal.component";
import {NativeSystemService} from "../../../native/system/native-system.service";

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

    secondaryFilesCount = 0;
    metadataKeysCount   = 0;

    @ViewChildren("arrayItem", {read: JobStepInspectorEntryComponent})
    private arrayElements: QueryList<JobStepInspectorEntryComponent>;

    @ViewChild("input", {read: ElementRef})

    private inputElement: ElementRef;

    private propagateTouch: any;

    private propagateChange: any;

    private control: AbstractControl;

    constructor(private cdr: ChangeDetectorRef,
                private modal: ModalService,
                private injector: Injector,
                private native: NativeSystemService,
                @Inject(APP_MODEL) private appModel) {
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
                const group = this.control as FormGroup;
                if (!value) {
                    for (const key in group.controls) {
                        group.controls[key].setValue(null, updateOptions);
                    }
                    break;
                }

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
                this.control.setValue(parseInt(update, 10), updateOptions);
                break;
            case "boolean":
                this.control.setValue(Boolean(update), updateOptions);
                break;

            case "Directory":
                update = value || {};
                this.control.setValue({
                    class: this.inputType,
                    path: update.path || ""
                }, updateOptions);
                this.recalculateSecondaryFilesAndMetadataCounts();
                break;
            case "File":

                update = value || {};
                this.control.setValue({
                    class: this.inputType,
                    path: update.path || "",
                    secondaryFiles: Array.isArray(update.secondaryFiles) ? update.secondaryFiles : [],
                    metadata: Object.prototype.isPrototypeOf(update.metadata) ? update.metadata : {}
                }, updateOptions);
                this.recalculateSecondaryFilesAndMetadataCounts();
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

        // console.log("Inhjected model", this.appModel);

        this.arrayElements.changes.subscribeTracked(this, list => {

            const plainInputTypes = ["boolean", "float", "int", "string", "enum"];

            if (plainInputTypes.indexOf(this.inputArrayItemsType) !== -1 && list.last) {
                list.last.focus();
            }
        });

        this.control.valueChanges.subscribeTracked(this, value => {
            this.recalculateSecondaryFilesAndMetadataCounts();
        });

        this.control.valueChanges
            .filter(v => this.control.status !== "DISABLED")
            .subscribeTracked(this, change => {

                let typecheckedChange = change;

                if (this.inputType === "int") {
                    typecheckedChange = parseInt(change, 10);
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
        const comp = this.modal.fromComponent(JobFileMetadataModalComponent, "Secondary files and metadata");

        const {secondaryFiles, metadata} = this.control.value;

        comp.secondaryFiles   = secondaryFiles;
        comp.metadata         = metadata;
        comp.allowDirectories = this.appModel.cwlVersion.indexOf("draft-2") === -1;

        comp.submit.take(1).subscribeTracked(this, (data) => {
            this.modal.close();
            this.control.patchValue(data);
            this.cdr.markForCheck();
        });
    }

    private recalculateSecondaryFilesAndMetadataCounts() {
        const ctrlVal = Object.prototype.isPrototypeOf(this.control.value) ? this.control.value : {};

        const {secondaryFiles, metadata} = ctrlVal;

        this.secondaryFilesCount = Array.isArray(secondaryFiles) ? secondaryFiles.length : 0;
        this.metadataKeysCount   = Object.prototype.isPrototypeOf(metadata) ? Object.keys(metadata).length : 0;

    }

    addArrayFileOrDirectory() {

        const properties = ["multiSelections"] as any;
        properties.push(this.inputArrayItemsType === "File" ? "openFile" : "openDirectory");


        this.native.openFileChoiceDialog({properties}).then(filePaths => {
            const items = filePaths.map(p => ({class: this.inputArrayItemsType, path: p}));

            items.forEach((c) => {
                (this.control as FormArray).push(new FormControl(c));
            });

            this.cdr.markForCheck();

        }, err => {

        });

    }
}

