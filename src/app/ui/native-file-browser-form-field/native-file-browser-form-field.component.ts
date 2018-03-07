import {
    ChangeDetectorRef,
    Component,
    forwardRef,
    Input,
    ViewChild,
    ElementRef,
    NgZone,
    ChangeDetectionStrategy,
    OnInit,
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl} from "@angular/forms";
import {NativeSystemService} from "../../native/system/native-system.service";
import {DirectiveBase} from "../../util/directive-base/directive-base";

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
        <input #pathInput class="form-control" [formControl]="control" (blur)="onTouched()"/>

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
export class NativeFileBrowserFormFieldComponent extends DirectiveBase implements ControlValueAccessor, OnInit {

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

    propagateChange: (value: any) => void;

    @ViewChild("pathInput")
    pathInputField: ElementRef;

    control = new FormControl("");

    constructor(private native: NativeSystemService, private cdr: ChangeDetectorRef, private zone: NgZone) {
        super();
    }

    ngOnInit() {
        this.control.valueChanges.subscribeTracked(this, value => {
            if (typeof this.propagateChange === "function") {
                this.propagateChange(value);
            }
        });

        this.updateControlDisabledState();
    }

    updateValue(val: string, options?: { emitEvent?: boolean }) {
        this.control.setValue(val, options);
        if (this.disableTextInput) {
            this.updateInputScroll();
        }
        this.cdr.markForCheck();
    }

    onBrowse() {

        const defaultPath = this.relativePathRoot || this.control.value;
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
                const value   = relPath.startsWith(path.sep) ? relPath.substr(1) : relPath;
                this.updateValue(value);

            } else {
                this.updateValue(file);
            }

        }).then(() => this.cdr.markForCheck()).catch(() => void 0);
    }

    writeValue(obj: any): void {

        if (obj === undefined) {
            return;
        }

        if (typeof obj !== "string") {
            obj = "";
        }

        this.updateValue(obj, {emitEvent: false});
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        this.updateControlDisabledState();
    }

    private updateControlDisabledState(options?: { emitEvent?: boolean, onlySelf?: boolean }) {
        (this.isDisabled || this.disableTextInput) ? this.control.disable(options) : this.control.enable(options);
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
