import {Component, ElementRef, forwardRef, Input, Renderer2, ViewChild} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {NativeSystemService} from "../../native/system/native-system.service";

@Component({
    selector: "ct-native-file-browser-form-field",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NativeFileBrowserFormFieldComponent),
            multi: true
        }
    ],
    template: `
        <input #pathInput class="form-control"
               [(ngModel)]="value"
               (blur)="onTouched()"/>

        <span class="input-group-btn">
            <button class="btn btn-secondary" type="button" (click)="onBrowse()">
                {{ browseLabel }}
            </button>
        </span>
    `
})
export class NativeFileBrowserFormFieldComponent implements ControlValueAccessor {

    /** Title of the modal windows that opens when user clicks on "browse" */
    @Input()
    modalTitle = "Choose File or Directory";

    /** Label of the button that spawns filepicker modal */
    @Input()
    browseLabel = "Browse";

    onTouched = () => void 0;

    onChange = (value: any) => void 0;

    @ViewChild("pathInput", {read: ElementRef})
    private pathInput: ElementRef;

    private _value = "";

    constructor(private dialog: NativeSystemService, private renderer: Renderer2) {
    }

    get value(): string {
        return this._value;
    }

    set value(val: string) {
        this._value = val;
        this.onChange(val);
    }

    onBrowse() {
        this.dialog
            .openFile({
                title: "Find the Rabix Executor",
                defaultPath: this.value
            })
            .then(files => this.value = files[0])
            .catch(() => void 0);
    }

    writeValue(obj: any): void {

        if (typeof obj !== "string") {
            obj = "";
        }

        this.value = obj;

    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.renderer.setProperty(this.pathInput.nativeElement, "disabled", isDisabled);
    }
}
