import {AfterViewInit, Component, EventEmitter, forwardRef, Input, OnInit, Output} from "@angular/core";
import {ControlValueAccessor, FormArray, FormControl, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";
import {noop} from "../../../lib/utils.lib";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-map-list",
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MapListComponent),
            multi: true
        }
    ],
    styleUrls: ["./map-list.component.scss"],
    template: `

        <div>
            <ct-blank-state *ngIf="controls.length === 0 && !readonly" (buttonClick)="add()" [hasAction]="true">
                <section tc-description>No entries defined</section>
                <section tc-button-text>Add an entry</section>
            </ct-blank-state>

            <div *ngFor="let ctrl of controls.controls; let i = index" class="list-item">

                <input class="form-control key-input" [formControl]="ctrl.get('key')" data-test="key-field" placeholder="key"/>

                <span class="input-group-addon add-on">:</span>

                <input class="form-control value-input" [formControl]="ctrl.get('value')" data-test="value-field" placeholder="value"/>

                <div *ngIf="!readonly" 
                     class="remove-icon"
                     ct-tooltip="Delete"
                     data-test="remove-entry-button"
                     (click)="remove(i)">
                    <i class="fa fa-trash clickable"></i>
                </div>

            </div>

        </div>

        <button type="button" *ngIf="controls.length !== 0 && !readonly"
                class="btn pl-0 btn-link no-outline no-underline-hover add-entry-btn"
                data-test="add-entry-button"
                (click)="add()">
            <i class="fa fa-plus"></i> Add an Entry
        </button>
    `
})
export class MapListComponent extends DirectiveBase implements ControlValueAccessor, AfterViewInit, OnInit {

    /** @deprecated Use this component as a form control outlet */
    @Input()
    readonly = false;

    /** @deprecated Use this component as a form control outlet */
    @Output()
    valueChange = new EventEmitter();

    list: { key: string, value: string }[] = [];

    private onTouchedCallback = noop;

    private propagateChange = noop;

    controls: FormArray;

    ngOnInit() {
        this.controls = new FormArray([]);
    }

    writeValue(writeObject = {}): void {

        let data = writeObject;
        if (data === null) {
            data = {};
            this.add();
            return;
        }

        const keys = Object.keys(data);
        this.resizeControlsArray(keys.length);
        const kvArr = this.convertToKVArray(data);
        this.controls.patchValue(kvArr, {emitEvent: false});
    }

    add() {
        const group = new FormGroup({
            key: new FormControl(""),
            value: new FormControl("")
        });

        if (this.readonly) {
            group.disable();
        }

        this.controls.push(group);
    }

    remove(i) {
        this.controls.removeAt(i);
    }

    ngAfterViewInit() {

        this.controls.valueChanges
            .map(() => this.makeMap())
            .distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
            .subscribeTracked(this, val => {
                this.propagateChange(val);
            });
    }

    registerOnChange(fn: any): void {
        this.propagateChange = (val = this.makeMap()) => {
            fn(val);
            this.valueChange.emit(val);
        };
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    setDisabledState(isDisabled: boolean): void {

        this.readonly = isDisabled;
    }

    private resizeControlsArray(size: number) {
        while (this.controls.length !== size) {
            if (this.controls.length > size) {
                this.controls.removeAt(0);
            } else if (this.controls.length < size) {


                const group = new FormGroup({
                    key: new FormControl(""),
                    value: new FormControl("")
                });

                if (this.readonly) {
                    group.disable();
                }

                this.controls.push(group);


            }
        }
    }

    private convertToKVArray(obj = {}): { key: string, value: string }[] {
        const patch = [];
        for (const k in obj) {

            let key = k;
            if (k === undefined || k === null) {
                key = "";
            } else {
                key = key.toString();
            }

            let value = obj[k];
            if (value === undefined || value === null) {
                value = "";
            } else {
                value = value.toString();
            }

            patch.push({key, value});
        }

        return patch;
    }

    private makeMap(controlArray = this.controls) {
        return controlArray.controls.reduce((acc, ctrl: FormGroup) => {
            let {key, value} = ctrl.value;

            key   = String(key).trim();
            value = String(value).trim();

            if (key === "" && value === "") {
                return acc;
            }

            return {...acc, [key]: value};
        }, {});
    }


}
