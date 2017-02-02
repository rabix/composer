import {Component, forwardRef} from "@angular/core";
import {
    ControlValueAccessor,
    FormArray,
    FormControl,
    FormGroup,
    NG_VALUE_ACCESSOR
} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";
import {noop} from "../../../lib/utils.lib";

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
        <div [formGroup]="formGroup">
            <div formArrayName="pairs" class="container">
                <div *ngFor="let item of formGroup.controls['pairs'].controls; let i = index"
                     [formGroupName]="i"
                     class="mb-1 row input-group">

                    <input class="form-control  col-xs-5" formControlName="key"
                           placeholder="key"/>
                    <span class="input-group-addon">:</span>
                    <input class="form-control col-xs-5" formControlName="value"
                           placeholder="value"/>
                    <span class="input-group-btn">
                        <button (click)="remove(i)" type="button"
                                class="input-group-addon btn btn-secondary ">
                            <i class="fa fa-trash"></i></button>
                    </span>

                </div>

                <div class="row">
                    <button class="pull-right btn btn-secondary btn-sm"
                            type="button"
                            (click)="add()">Add an Entry
                    </button>
                </div>
            </div>
        </div>
    `
})
export class MapListComponent extends ComponentBase implements ControlValueAccessor {

    public list: { key: string, value: string }[] = [];

    public formGroup = new FormGroup({
        pairs: new FormArray([])
    });

    private onTouchedCallback = noop;

    private onChangeCallback = noop;

    private add() {
        this.list = this.list.concat({key: "", value: ""});
        this.resizeControls();
    }

    private remove(i) {
        this.list = this.list.slice(0, i).concat(this.list.slice(i + 1));
        (this.formGroup.get("pairs") as FormArray).removeAt(i);
    }

    private resizeControls() {
        const controlArray = this.formGroup.get("pairs") as FormArray;
        const lengthDiff   = this.list.length - controlArray.length;

        for (let i = 0; i < Math.abs(lengthDiff); i++) {
            if (lengthDiff > 0) {
                controlArray.insert(controlArray.length, new FormGroup({
                    key: new FormControl(""),
                    value: new FormControl(""),
                }));
                continue;
            }

            controlArray.removeAt(controlArray.length - 1);

        }
        controlArray.patchValue(this.list);

    }

    ngAfterViewInit() {

        this.formGroup.valueChanges
            .map(ch => ch.pairs)
            .do(pairs => this.list = pairs)
            .distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
            .map(pairs => pairs
                .filter(i => i.key.trim())
                .reduce((acc, item) => ({...acc, ...{[item.key]: item.value}}), {}))
            .subscribe(val => {
                this.onChangeCallback(val);
            });
    }

    writeValue(obj: any): void {


        const entryList = Object.keys(obj).map(key => ({key, value: obj[key]}));
        this.list.forEach((e, i) => {
            if (!e.key) {
                entryList.splice(i, 0, e);
            }
        });

        this.list = entryList;
        this.resizeControls();
        this.onChangeCallback(this.list);
    }

    registerOnChange(fn: any): void {
        this.onChangeCallback = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouchedCallback = fn;
    }

    setDisabledState(isDisabled: boolean): void {
    }
}
