import {ChangeDetectorRef, Component, forwardRef, Input, ViewChild, ElementRef, NgZone, ChangeDetectionStrategy,} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {NativeSystemService} from "../../native/system/native-system.service";

const path = require("path");

type SelectionType = "file" | "directory";

@Component({
    selector: "ct-native-file-browser-form-field",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => NativeFileBrowserFormFieldComponent),
            multi: true
        }
    ],
    template: `
        <input #pathInput class="form-control" [(ngModel)]="value" (blur)="onTouched()" [disabled]="isDisabled || disableTextInput"/>

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

    @Input() disableTextInput = true;

    @Input() relativePathRoot: string;

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

    onTouched: Function;

    onChange: (value: any) => void;

    @ViewChild("pathInput")
    pathInputField: ElementRef;

    private _value = "";

    constructor(private native: NativeSystemService, private cdr: ChangeDetectorRef, private zone: NgZone) {
    }

    get value(): string {
        return this._value;
    }

    set value(val: string) {
        this._value = val;

        if (typeof this.onChange === "function") {
            this.onChange(val);
        }

        if (this.disableTextInput) {
            this.updateInputScroll();
        }

        this.cdr.markForCheck();
    }

    onBrowse() {

        const defaultPath = this.relativePathRoot || this.value;
        const params      = Object.assign({
            title: this.modalTitle,
            defaultPath
        }, this.dialogOptions);

        let opener;

        switch (this.selectionType) {
            case "directory":
                opener = this.native.openFolderChoiceDialog(params);
                break;

            case "file":
            default:
                opener = this.native.openFileChoiceDialog(params);
                break;
        }

        opener.then(files => {
            const [file] = files;

            if (this.relativePathRoot) {
                const relPath = path.relative(this.relativePathRoot, path.dirname(file)) + path.sep + path.basename(file);
                this.value    = relPath.startsWith(path.sep) ? relPath.substr(1) : relPath;

            } else {
                this.value = file;
            }

        }).then(() => this.cdr.markForCheck()).catch(() => void 0);
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

    private updateInputScroll() {

        this.zone.runOutsideAngular(() => {

            setTimeout(() => {
                if (!this.pathInputField && !this.pathInputField.nativeElement) {
                    return;
                }

                const el = this.pathInputField.nativeElement;
                if (this.isDisabled || this.disableTextInput) {
                    el.scrollLeft = el.scrollWidth;
                }
            });

        });


    }
}
