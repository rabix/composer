import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    forwardRef,
    Inject,
    Injector,
    Input,
    OnChanges,
    QueryList,
    SimpleChanges,
    ViewChild,
    ViewChildren
} from "@angular/core";
import {AbstractControl, ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {InputParameterModel} from "cwlts/models/generic/InputParameterModel";
import {AppModelToken} from "../../core/factories/app-model-provider-factory";
import {ModalService} from "../../ui/modal/modal.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";
import {FileMetadataModalComponent} from "../file-metadata-modal/file-metadata-modal.component";
import {NativeSystemService} from "../../native/system/native-system.service";
import {take, filter} from "rxjs/operators";

@Component({
    selector: "ct-input-value-editor",
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: "./input-value-editor.component.html",
    styleUrls: ["./input-value-editor.component.scss"],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => InputValueEditorComponent),
        multi: true
    }]
})
export class InputValueEditorComponent extends DirectiveBase implements OnChanges, AfterViewInit, ControlValueAccessor {

    @Input() readonly = false;

    @Input() inputType: string;

    @Input() inputArrayItemsType: string;

    @Input() inputEnumSymbols: string[];

    @Input() inputRecordFields: InputParameterModel[];

    @Input() relativePathRoot?: string;

    /**
     * We might want to show a warning next to a field.
     * This can happen for example if we encounter a mismatch between step value and the input type,
     * for example, an input can by File[], and the step value can be just a plain string.
     */
    warning: string;

    secondaryFilesCount = 0;
    metadataKeysCount   = 0;

    @ViewChildren("arrayItem", {read: InputValueEditorComponent})
    private arrayElements: QueryList<InputValueEditorComponent>;

    @ViewChild("input", {read: ElementRef})

    private inputElement: ElementRef;

    private propagateTouch: any;

    private propagateChange: any;

    private control: AbstractControl;

    constructor(private cdr: ChangeDetectorRef,
                private modal: ModalService,
                private injector: Injector,
                private native: NativeSystemService,
                @Inject(AppModelToken) private appModel) {
        super();

    }

    writeValue(value: any): void {

        console.log("Write input value", value);

        if (value === undefined) {
            return;
        }

        const updateOptions = {emitEvent: false};
        this.warning        = undefined;

        let update = value;
        switch (this.inputType) {

            case "record":
                update      = value instanceof Object ? value : {} as InputParameterModel;
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
                    this.patchArrayValue([], updateOptions);
                } else {
                    this.patchArrayValue(update, updateOptions);
                }

                break;

            case "string":
                this.control.setValue(update ? String(update) : "", updateOptions);
                break;

            case "float":
                const float = parseFloat(update);
                this.control.setValue(isNaN(float) ? 0 : float, updateOptions);
                break;
            case "int":
                const int = parseInt(update);
                this.control.setValue(isNaN(int) ? 0 : int, updateOptions);
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
        this.arrayElements.changes.subscribeTracked(this, list => {

            const plainInputTypes = ["boolean", "float", "int", "string", "enum"];

            if (plainInputTypes.indexOf(this.inputArrayItemsType) !== -1 && list.last) {
                list.last.focus();
            }
        });
    }

    /**
     * Whenever our inputs change, we should recreate form controls for this component
     */
    ngOnChanges(changes: SimpleChanges): void {

        if (changes.inputType || changes.inputRecordFields) {
            this.setupFormControls();
        }

        if (changes.inputType) {
            this.bindFileMetadataSyncOnControlChanges();
            this.bindValuePropagationOnControlSetup();
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
        this.warning  = undefined;
        const control = this.makeControlForArray();
        (this.control as FormArray).push(control);
    }

    deleteFromArray(index: number, control = this.control as FormArray): void {
        control.removeAt(index);
    }

    focus(): void {
        if (this.inputElement && this.inputElement.nativeElement) {
            this.inputElement.nativeElement.focus();
        }
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
        const {secondaryFiles, metadata} = this.control.value;
        const allowDirectories           = this.appModel.cwlVersion.indexOf("draft-2") === -1;
        const relativePathRoot           = this.relativePathRoot;

        const comp = this.modal.fromComponent(FileMetadataModalComponent, "Secondary files and metadata", {
            metadata,
            secondaryFiles,
            allowDirectories,
            relativePathRoot
        });

        comp.submit.pipe(
            take(1)
        ).subscribeTracked(this, (data) => {
            this.modal.close();
            this.control.patchValue(data);
            this.cdr.markForCheck();
        });
    }

    addArrayFileOrDirectory() {

        const properties = ["multiSelections"] as any;
        properties.push(this.inputArrayItemsType === "File" ? "openFile" : "openDirectory");

        this.native.openFileChoiceDialog({properties}).then(filePaths => {

            const fileOrDirEntries = filePaths.map(p => ({class: this.inputArrayItemsType, path: p}));
            fileOrDirEntries.forEach(entry => (this.control as FormArray).push(new FormControl(entry)));
            this.cdr.markForCheck();

        }, () => void 0);
    }

    private bindFileMetadataSyncOnControlChanges() {
        this.control.valueChanges.subscribeTracked(this, () => {
            this.recalculateSecondaryFilesAndMetadataCounts();
        });
    }

    private bindValuePropagationOnControlSetup() {
        this.control.valueChanges.pipe(
            // We this is called from  ngOnChanges, so on first call propagateChange will not be set,
            // therefore, we should not try to propagate the value right away
            filter(() => this.control.status !== "DISABLED" && typeof this.propagateChange === "function")
        ).subscribeTracked(this, change => {

            let typecheckedChange = change;

            if (this.inputType === "int") {
                typecheckedChange = parseInt(change, 10);
            } else if (this.inputType === "float") {
                typecheckedChange = isNaN(change) ? 0 : parseFloat(change);
            }

            this.propagateChange(typecheckedChange);
        });
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

    private patchArrayValue(update: any[], options: { onlySelf?: boolean, emitEvent?: boolean }) {

        const updateIsSameSize  = update.length === (this.control as FormArray).length;
        const serializesEqually = () => JSON.stringify(update) === JSON.stringify(this.control.value);
        const shouldNotEmit     = options.emitEvent === false;

        // This solves a problem that
        if (updateIsSameSize && shouldNotEmit && serializesEqually()) {
            return;
        }

        if (!updateIsSameSize) {
            const ctrlArr = Array.apply(null, Array(update.length)).map(() => this.makeControlForArray());
            this.control  = new FormArray(ctrlArr);
            this.readonly ? this.control.disable(options) : this.control.enable(options);
            this.bindFileMetadataSyncOnControlChanges();
            this.bindValuePropagationOnControlSetup();
        }

        this.control.setValue(update, options);
    }

    private makeControlForArray(): AbstractControl {

        switch (this.inputArrayItemsType) {

            case "array":
                return new FormArray([]);
            case "record":
                return new FormControl({});
            case "string":
                return new FormControl("");
            case "int":
            case "float":
                return new FormControl(0);
            case "boolean":
                return new FormControl(false);
            case "Directory":
                return new FormControl({
                    class: "Directory",
                    path: ""
                });
            case "File":
                return new FormControl({
                    path: "",
                    class: "File",
                    metadata: {},
                    secondaryFiles: [],
                });
            default:
                return new FormControl();

        }
    }

    private recalculateSecondaryFilesAndMetadataCounts() {
        const ctrlVal = Object.prototype.isPrototypeOf(this.control.value) ? this.control.value : {};

        const {secondaryFiles, metadata} = ctrlVal;

        this.secondaryFilesCount = Array.isArray(secondaryFiles) ? secondaryFiles.length : 0;
        this.metadataKeysCount   = Object.prototype.isPrototypeOf(metadata) ? Object.keys(metadata).length : 0;

    }
}

