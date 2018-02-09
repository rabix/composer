import {Component, forwardRef, Input, OnDestroy} from "@angular/core";
import {ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {SBDraft2ExpressionModel} from "cwlts/models/d2sb";
import {noop} from "../../../lib/utils.lib";
import {Guid} from "../../../services/guid.service";
import {ModalService} from "../../../ui/modal/modal.service";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

/**
 * @deprecated
 */
@Component({
    selector: "ct-key-value-list",
    styleUrls: ["./key-value-list.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => KeyValueListComponent),
            multi: true
        }
    ],
    template: `
        <div>

            <!--Blank Tool Screen-->
            <ct-blank-state *ngIf="!readonly && !keyValueFormList.length"
                            [hasAction]="true"
                            [title]="emptyListText"
                            [buttonText]="addEntryText"
                            [learnMoreURL]="helpLink"
                            (buttonClick)="addEntry()">
            </ct-blank-state>


            <!--List Header Row-->
            <div class="header-row form-control-label" *ngIf="!!keyValueFormList.length">
                <div class="header-title">{{keyColumnText}}</div>
                <div class="header-title">{{valueColumnText}}</div>
            </div>

            <!--Input List Entries-->
            <ul class="editor-list">

                <!--List Entry-->
                <li class="mb-1 container"
                    *ngFor="let entry of keyValueFormList; let i = index">

                    <div class="clickable row"
                         [class.invalid-entry]="duplicateKeys.has(form.controls[entry.id].value.key)">

                        <ct-key-value-input
                                [context]="context"
                                [formControl]="form.controls[entry.id]"
                                [keyValidator]="keyValidator"
                                [isDuplicate]="duplicateKeys.has(form.controls[entry.id].value.key)">

                            <div *ngIf="!!entry" class="remove-icon">
                                <i title="Delete" class="fa fa-trash text-hover-danger"
                                   (click)="removeEntry(entry)"></i>
                            </div>
                        </ct-key-value-input>
                    </div>

                </li>

            </ul>
        </div>

        <!--Add entry link-->
        <button *ngIf="!readonly && !!keyValueFormList.length"
                (click)="addEntry()"
                type="button"
                class="btn pl-0 btn-link no-outline no-underline-hover">
            <i class="fa fa-plus"></i> {{addEntryText}}
        </button>
    `
})
export class KeyValueListComponent extends DirectiveBase implements ControlValueAccessor, OnDestroy {

    @Input()
    readonly = false;

    @Input()
    context: { $job: any } = {$job: {}};

    @Input()
    addEntryText = "";

    @Input()
    emptyListText = "";

    @Input()
    keyColumnText = "Key";

    @Input()
    valueColumnText = "Value";

    @Input()
    allowDuplicateKeys = true;

    @Input()
    helpLink = "";

    @Input()
    keyValidator = noop;

    keyValueFormList: {
        id: string,
        model: {
            key?: string,
            value: string | SBDraft2ExpressionModel,
            readonly?: boolean
        }
    }[] = [];

    private onTouched = noop;

    private propagateChange = noop;

    form = new FormGroup({}, this.duplicateKeyValidator.bind(this));

    duplicateKeys = new Set();

    constructor(private modal: ModalService) {
        super();
    }

    writeValue(keyValueList: {
                   key?: string,
                   value: string | SBDraft2ExpressionModel,
                   readonly?: boolean
               }[]): void {

        this.keyValueFormList = keyValueList.map(entry => {
            return {
                id: Guid.generate(),
                model: entry
            };
        });

        this.keyValueFormList.forEach(hint => {
            this.form.addControl(
                hint.id,
                new FormControl(hint.model)
            );
        });

        this.tracked = this.form.valueChanges.subscribe(change => {
            const newKeyValueList = [];
            const uniqueKeys: string[] = [];

            Object.keys(change).forEach(key => {
                if (uniqueKeys.indexOf(change[key].key) === -1) {
                    newKeyValueList.push(change[key]);
                    uniqueKeys.push(change[key].key);
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

    duplicateKeyValidator(g: FormGroup) {
        if (!this.duplicateKeys || this.allowDuplicateKeys) {
            return;
        }

        this.duplicateKeys.clear();
        const keySet = new Set();

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

        return this.duplicateKeys.size > 0 ? {message: "There are duplicates in the form."} : null;
    }

    addEntry(): void {
        const newEntry = {
            id: Guid.generate(),
            model: {
                key: "",
                value: new SBDraft2ExpressionModel(null, ""),
                readonly: false
            }
        };

        this.keyValueFormList.push(newEntry);
        this.form.addControl(newEntry.id, new FormControl(newEntry.model));
    }

    removeEntry(ctrl: { id: string, model: SBDraft2ExpressionModel }): void {
        this.modal.delete("key-value pair").then(() => {
            this.keyValueFormList = this.keyValueFormList.filter(item => item.id !== ctrl.id);
            this.form.removeControl(ctrl.id);
            this.form.markAsDirty();
        }, err => console.warn);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.keyValueFormList.forEach(item => this.form.removeControl(item.id));
    }

    setDisabledState(isDisabled: boolean): void {
        this.readonly = isDisabled;
    }
}
