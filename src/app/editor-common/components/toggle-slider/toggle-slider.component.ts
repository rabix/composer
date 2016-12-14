import {Component, forwardRef, Input} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";

require("./toggle-slider.component.scss");

@Component({
    selector: "toggle-slider",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleComponent), multi: true }
    ],
    template: `
        <span>{{ isChecked ? on : off }}</span>

        <label class="switch">
            <input type="checkbox" [checked]="isChecked" (change)="toggleCheck()">
            <div class="slider round"></div>
        </label>
    `
})
export class ToggleComponent implements ControlValueAccessor {

    private isChecked: boolean = false;

    @Input()
    on: string;

    @Input()
    off: string;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private toggleCheck(): void {
        this.isChecked = !this.isChecked;
        this.propagateChange(this.isChecked);
    }

    writeValue(isChecked: boolean): void {
        this.isChecked = !!isChecked;
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
