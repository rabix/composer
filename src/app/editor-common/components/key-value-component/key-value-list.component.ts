import {Component, forwardRef, Input} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroup, FormControl, ValidatorFn} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";
import {GuidService} from "../../../services/guid.service";

require("./key-value-list.component.scss");

@Component({
    selector: "key-value-list",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KeyValueListComponent),
            multi: true
        }
    ],
    template: `
           <ct-blank-tool-state *ngIf="!readonly && !keyValueFormList.length"
                         [title]="emptyListText"
                         [buttonText]="addEntryText"
                         [learnMoreURL]="helpLink"
                         (buttonClick)="addEntry()">
           </ct-blank-tool-state>

                <div *ngIf="keyValueFormList.length" class="container">
                    <div class="gui-section-list-title col-sm-12 row">
                        <div class="col-sm-5">{{keyColumnText}}</div>
                        <div class="col-sm-6">{{valueColumnText}}</div>
                    </div>

                    <ul class="gui-section-list">

                        <li class="col-sm-12 gui-section-list-item clickable row"
                            *ngFor="let entry of keyValueFormList; let i = index"
                            [class.invalid-entry]="!form.controls[entry.id].valid">
                        
                            <ct-key-value-input 
                                    [context]="context"
                                    [formControl]="form.controls[entry.id]"
                                    [keyValidators]="keyValidators"
                                    [valueValidators]="valueValidators">
                                            
                                <div *ngIf="!!entry" class="col-sm-1 align-right">
                                    <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(entry)"></i>
                                </div>
                            </ct-key-value-input>
                        </li>
                        
                    </ul>
                </div>

                <button *ngIf="!readonly && keyValueFormList.length"
                        (click)="addEntry()"
                        type="button"
                        class="btn pl-0 btn-link no-outline no-underline-hover">
                    <i class="fa fa-plus"></i> {{addEntryText}}
                </button>
    `
})
export class KeyValueListComponent extends ComponentBase implements ControlValueAccessor {

    @Input()
    public context: {$job: any} = { $job: {} };

    @Input()
    public addEntryText = "";

    @Input()
    public emptyListText = "";

    @Input()
    public keyColumnText = "Key";

    @Input()
    public valueColumnText = "Value";

    @Input()
    public keyValidators: ValidatorFn[] = [() => null];

    @Input()
    public valueValidators: ValidatorFn[] = [() => null];

    @Input()
    public allowDuplicateKeys = true;

    @Input()
    public helpLink = "";

    private keyValueFormList: {
        id: string,
        model: {
            key?: string,
            value: string | ExpressionModel,
            readonly?: boolean
        }
    }[] = [];

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private form = new FormGroup({});

    private currentKeyValueList: {
        key?: string,
        value: string | ExpressionModel,
        readonly?: boolean
    }[] = [];

    constructor(private guidService: GuidService) {
        super();
    }

    ngOnInit() {
        if (!this.allowDuplicateKeys) {
            this.keyValidators = this.keyValidators.concat(this.duplicateKeyValidator.bind(this));
        }
    }

    writeValue(keyValueList: {
        key?: string,
        value: string | ExpressionModel,
        readonly?: boolean
    }[]): void {

        this.keyValueFormList = keyValueList.map(entry => {
            return {
                id: this.guidService.generate(),
                model: entry
            }
        });

        this.keyValueFormList.forEach(hint => {
            this.form.addControl(hint.id, new FormControl(hint.model));
        });

        this.tracked = this.form.valueChanges.subscribe(change => {
            this.currentKeyValueList = Object.keys(change).map(key => change[key]);
            this.propagateChange(this.currentKeyValueList);
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private duplicateKeyValidator(c: FormControl): null | {message: string} {
        if (!c.value) {
            return null;
        }

        let keySet = new Set();

        this.currentKeyValueList.forEach((item) => {
            if (!!c.value.trim()) {
                keySet.add(item.key);
            }
        });

        const keySetClone = new Set(keySet);

        if (!!c.value.trim() && keySetClone.size === keySet.add(c.value).size) {
            return {
                message: "Duplicate keys are not allowed."
            }
        }

        return null;
    }

    private addEntry(): void {
        const newEntry = {
            id: this.guidService.generate(),
            model: {
                key: "",
                value: new ExpressionModel(null, ""),
                readonly: false
            }
        };

        this.keyValueFormList.push(newEntry);
        this.form.addControl(newEntry.id, new FormControl(newEntry.model));
    }

    private removeEntry(ctrl: {id: string, model: ExpressionModel}): void {
        this.keyValueFormList = this.keyValueFormList.filter(item => item.id !== ctrl.id);
        this.form.removeControl(ctrl.id);
        this.form.markAsDirty();
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.keyValueFormList.forEach(item => this.form.removeControl(item.id));
    }
}
