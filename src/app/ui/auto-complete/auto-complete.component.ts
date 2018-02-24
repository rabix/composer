import {Component, forwardRef, Input, OnInit} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {Subject} from "rxjs/Subject";
import {noop} from "../../lib/utils.lib";
import {SelectComponent} from "./select/select.component";
import {distinctUntilChanged} from "rxjs/operators";

@Component({
    selector: "ct-auto-complete",
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => AutoCompleteComponent), multi: true
    }],
    template: `<input #el [placeholder]="placeholder">`,
    styleUrls: ["./auto-complete.component.scss"],
})
export class AutoCompleteComponent extends SelectComponent implements ControlValueAccessor, OnInit {

    // Important inputs -> [options], [create], see parent class...

    // Set disabled/enabled state
    @Input("readonly") set disableControl(disabled: boolean) {
        this.setDisabledState(disabled);
    }

    // True makes control mono-selection (suggested input)
    @Input() mono        = false;

    @Input() placeholder = "";

    // Specify the return type of a value that will be propagated
    @Input()
    type: "string" | "number" = "string";

    private update          = new Subject();
    private onTouched       = noop;
    private propagateChange = noop;


    ngOnInit() {
        if (this.mono) {
            this.maxItems = 1;
            this.hideSelected = false;
        }

        this.update.pipe(
            distinctUntilChanged()
        ).subscribeTracked(this, (value) => {
            this.propagateChange(value);
        });
    }

    writeValue(obj: any): void {
        this.updateOptions(obj ? obj : []);
    }

    onChange(value: string) {
        // If onChange is triggered because of user actions (add/remove item)
        if (this.shouldTriggerChange) {

            // Trigger change detection when value is changed because of user interaction with component
            this.zone.run(() => {
            const parse = this.type === "string" ? (value) => value : (value) => parseFloat(value);
            this.update.next(this.mono ?
                parse(value) : (value ? value.split(this.delimiter).map((item) => parse(item)) : []));
            });
        }

    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState (disabled: boolean) {
        this.setDisabled(disabled);
    }
}

