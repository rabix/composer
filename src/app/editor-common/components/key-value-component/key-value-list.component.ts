import {Component, forwardRef, Input} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor, FormGroup, FormControl} from "@angular/forms";
import {ExpressionModel} from "cwlts/models/d2sb";
import {ComponentBase} from "../../../components/common/component-base";
import {GuidService} from "../../../services/guid.service";
import {noop} from "../../../lib/utils.lib";
import {ModalService} from "../../../components/modal/modal.service";

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
    <div class="container">
    
            <!--Blank Tool Screen-->
            <ct-blank-tool-state *ngIf="!readonly && !keyValueFormList.length"
                         [title]="emptyListText"
                         [buttonText]="addEntryText"
                         [learnMoreURL]="helpLink"
                         (buttonClick)="addEntry()">
            </ct-blank-tool-state>

            <!--List Header Row-->
            <div class="gui-section-list-title row" *ngIf="keyValueFormList.length">
                <div class="col-sm-5">{{keyColumnText}}</div>
                <div class="col-sm-6">{{valueColumnText}}</div>
            </div>
            
            <!--Input List Entries-->
            <ul class="gui-section-list">
            
                <!--List Entry-->
                <li class="input-list-items container"
                    *ngFor="let entry of keyValueFormList; let i = index">
            
                    <div class="gui-section-list-item clickable row"
                        [class.invalid-entry]="duplicateKeys.has(form.controls[entry.id].value.key)">

                        <ct-key-value-input 
                                [context]="context"
                                [formControl]="form.controls[entry.id]"
                                [keyValidator]="keyValidator"
                                [isDuplicate]="duplicateKeys.has(form.controls[entry.id].value.key)">
                                        
                            <div *ngIf="!!entry" class="col-sm-1 align-right">
                                <i title="Delete" class="fa fa-trash text-hover-danger" (click)="removeEntry(entry)"></i>
                            </div>
                        </ct-key-value-input>
                    </div>              
            
                </li>
                
            </ul>            
    </div>
    
    <!--Add entry link-->
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
    public readonly = false;

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
    public allowDuplicateKeys = true;

    @Input()
    public helpLink = "";

    @Input()
    public keyValidator = () => null;

    private keyValueFormList: {
        id: string,
        model: {
            key?: string,
            value: string | ExpressionModel,
            readonly?: boolean
        }
    }[] = [];

    private onTouched = noop;

    private propagateChange = noop;

    private form = new FormGroup({}, this.duplicateKeyValidator.bind(this));

    private duplicateKeys = new Set();

    constructor(private guidService: GuidService, private modal: ModalService) {
        super();
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
            this.form.addControl(
                hint.id,
                new FormControl(hint.model)
            );
        });

        this.tracked = this.form.valueChanges.subscribe(change => {
            let newKeyValueList = [];
            let uniqueKeys: string[] = [];

            Object.keys(change).forEach(key => {
                if (uniqueKeys.indexOf(change[key].key) === - 1) {
                    newKeyValueList.push(change[key]);
                    uniqueKeys.push(change[key].key)
                }
            });

            this.propagateChange(newKeyValueList);
        });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private duplicateKeyValidator(g: FormGroup) {
        if (!this.duplicateKeys || this.allowDuplicateKeys) {
            return;
        }

        this.duplicateKeys.clear();
        let keySet = new Set();

        Object.keys(g.controls)
            .filter(key => !!g.controls[key].value.key)
            .map(key => g.controls[key].value.key)
            .forEach((key) => {
                if (keySet.has(key)) {
                    this.duplicateKeys.add(key);
                } else {
                    keySet.add(key);
                }
            });

        return this.duplicateKeys.size > 0 ? { message: "There are duplicates in the form." }: null;
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
        this.modal.confirm({
            title: "Really Remove?",
            content: `Are you sure that you want to remove this key-value pair?`,
            cancellationLabel: "No, keep it",
            confirmationLabel: "Yes, remove it"
        }).then(() => {
            this.keyValueFormList = this.keyValueFormList.filter(item => item.id !== ctrl.id);
            this.form.removeControl(ctrl.id);
            this.form.markAsDirty();
        }, noop);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.keyValueFormList.forEach(item => this.form.removeControl(item.id));
    }
}
