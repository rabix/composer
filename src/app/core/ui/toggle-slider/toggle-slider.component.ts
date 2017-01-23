import {Component, forwardRef, Input} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";

require("./toggle-slider.component.scss");

@Component({
    selector: "ct-toggle-slider",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleComponent), multi: true }
    ],
    template: `
        <span>{{ value ? on : off }}</span>

        <label class="switch">
            <input type="checkbox" [checked]="value" (change)="toggleCheck()">
            <div class="slider round"></div>
        </label>
    `
})
export class ToggleComponent implements ControlValueAccessor {

    @Input()
    public on = "On";

    @Input()
    public off = "Off";

    @Input()
    public value = false;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private toggleCheck(): void {
        this.value = !this.value;
        this.propagateChange(this.value);
    }

    writeValue(isChecked: boolean): void {
        this.value = !!isChecked;
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
