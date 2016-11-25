import {Component, forwardRef} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import {ComponentBase} from "../../../components/common/component-base";

require("./toggle-slider.component.scss");

@Component({
    selector: "toggle-slider",
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleComponent), multi: true }
    ],
    template: `
        <label class="switch">
              <input type="checkbox" [checked]="isChecked" (change)="toggleCheck()">
              <div class="slider round"></div>
        </label>
    `
})
export class ToggleComponent extends ComponentBase implements ControlValueAccessor {

    private isChecked: boolean = false;

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private toggleCheck(): void {
        this.isChecked = !this.isChecked;
        this.propagateChange(this.isChecked);
    }

    private writeValue(isChecked: boolean): void {
        this.isChecked = isChecked;
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}
