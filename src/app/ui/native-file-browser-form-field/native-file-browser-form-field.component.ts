import {ChangeDetectorRef, Component, forwardRef, Input, Renderer2} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {NativeSystemService} from "../../native/system/native-system.service";

type SelectionType = "file" | "directory";

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
        <input #pathInput class="form-control" [(ngModel)]="value" (blur)="onTouched()" [disabled]="isDisabled"/>

        <span class="input-group-btn">
            <button class="btn btn-secondary" type="button" (click)="onBrowse()" [disabled]="isDisabled">
                <i *ngIf="useIcon; else textTpl" class="browse-icon fa {{ browseIcon }}"></i>
                
                <ng-template #textTpl>
                    {{ browseLabel }}
                </ng-template>
            </button>
        </span>
    `,

})
export class NativeFileBrowserFormFieldComponent implements ControlValueAccessor {

    /** Title of the modal windows that opens when user clicks on "browse" */
    @Input() modalTitle = "Choose File or Directory";

    /** Label of the button that spawns filepicker modal */
    @Input() browseLabel = "Browse";

    @Input() browseIcon = "fa-search";

    @Input() useIcon = false;

    @Input() selectionType: SelectionType = "file";

    @Input() dialogOptions: {
        title?: string;
        defaultPath?: string;
        buttonLabel?: string;
        filters?: {
            extensions: string[];
            name: string
        }[];
        properties?: Array<"openFile" |
            "openDirectory" |
            "multiSelections" |
            "showHiddenFiles" |
            "createDirectory" |
            "promptToCreate" |
            "noResolveAliases" |
            "treatPackageAsDirectory">;
        message?: string;
    } = {};

    isDisabled = false;

    onTouched = () => void 0;

    onChange = (value: any) => void 0;

    private _value = "";


    constructor(private dialog: NativeSystemService, private renderer: Renderer2, private cdr: ChangeDetectorRef) {
    }

    get value(): string {
        return this._value;
    }

    set value(val: string) {
        this._value = val;
        this.onChange(val);
    }

    onBrowse() {

        const params = Object.assign({
            title: this.modalTitle,
            defaultPath: this.value
        }, this.dialogOptions);

        let opener;

        switch (this.selectionType) {
            case "directory":
                opener = this.dialog.openFolderChoiceDialog(params);
                break;

            case "file":
            default:
                opener = this.dialog.openFileChoiceDialog(params);
                break;
        }

        opener.then(files => this.value = files[0])
            .then(() => this.cdr.markForCheck())
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
        this.isDisabled = isDisabled;
    }
}
