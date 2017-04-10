import {AfterViewInit, Component, EventEmitter, forwardRef, Output} from "@angular/core";
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
    template: `
        <div [formGroup]="formGroup" (change)="onInputsFormChange($event)">
            <div formArrayName="pairs">
                <div *ngFor="let item of getPairControls(); let i = index" [formGroupName]="i" class="mb-1 input-group row">

                    <input class="form-control  col-xs-5" formControlName="key" placeholder="key"/>
                    <span class="input-group-addon col-xs-1">:</span>
                    <input class="form-control col-xs-5" formControlName="value" placeholder="value"/>
                    <span class="input-group-btn col-xs-1">
                        <button (click)="remove(i)" type="button"
                                class="input-group-addon btn btn-secondary ">
                            <i class="fa fa-trash"></i></button>
                    </span>

                </div>

                <div class="row">
                    <button class="pull-right btn btn-secondary btn-sm" type="button" (click)="add()">Add an Entry</button>
                </div>
            </div>
        </div>
    `
})
export class MapListComponent extends DirectiveBase implements ControlValueAccessor, AfterViewInit {
    public list: { key: string, value: string }[] = [];

    public formGroup = new FormGroup({
        pairs: new FormArray([])
    });

    private onTouchedCallback = noop;

    private onChangeCallback = noop;

    @Output()
    public change = new EventEmitter();

    add() {
        this.list = this.list.concat({key: "", value: ""});
        this.resizeControls();
    }

    remove(i) {
        this.list = this.list.slice(0, i).concat(this.list.slice(i + 1));
        (this.formGroup.get("pairs") as FormArray).removeAt(i);

    }

    private resizeControls() {
        const newControlArray = new FormArray(this.list.map((pair) => new FormGroup({
                key: new FormControl(pair.key),
                value: new FormControl(pair.value)
            })
        ));

        this.formGroup.setControl("pairs", newControlArray);
    }

    ngAfterViewInit() {
        this.formGroup.valueChanges
            .map(ch => ch.pairs)
            .do(pairs => this.list = pairs)
            .distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
            .map(pairs => pairs
                .filter(i => i.key.trim())
                .reduce((acc, item) => ({...acc, ...{[item.key.trim()]: item.value.toString().trim()}}), {}))
            .subscribe(val => {
                this.onChangeCallback(val);
            });
    }

    writeValue(obj: any): void {
        if (!obj) {
            obj = {};
        }

        const entryList = Object.keys(obj).map(key => ({key, value: obj[key]}));
        this.list.forEach((e, i) => {
            if (!e.key.toString().length) {
                entryList.splice(i, 0, e);
            }
        });
        if (this.list.toString() === entryList.toString()) {
            return;
        }
        this.list = entryList;
        this.resizeControls();
    }

    registerOnChange(fn: any): void {
        this.onChangeCallback = (val) => {
            fn(val);
            this.change.emit(val);
        };
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    setDisabledState(isDisabled: boolean): void {
    }

    onInputsFormChange($event) {
        $event.stopPropagation();
    }

    getPairControls() {
        return (this.formGroup.get("pairs") as FormArray).controls;
    }
}
