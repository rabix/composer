import {Component, EventEmitter, forwardRef, Input, OnInit, Output, Renderer, ViewChild} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {noop} from "../../lib/utils.lib";

@Component({
    selector: "ct-toggle-slider",
    styleUrls: ["./toggle-slider.component.scss"],
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleSliderComponent), multi: true}
    ],
    template: `
        <label class="clickable">
            {{ value ? on : off }}
            <div class="switch" tabindex="0" (keyup.space)="toggleCheck($event)">
                <input class="toggle-input" #checkbox type="checkbox" [checked]="value" (click)="toggleCheck($event)" [disabled]="disabled">
                <div class="slider round" data-test="toggle-slider" [class.disabled]="disabled"></div>
            </div>
        </label>
    `
})
export class ToggleSliderComponent implements ControlValueAccessor, OnInit {

    @Input()
    readonly = false;

    @Input()
    on = "Yes";

    @Input()
    off = "No";

    @Input()
    value = false;

    @Input()
    disabled = false;

    @Output()
    valueChange = new EventEmitter();

    @ViewChild("checkbox") checkbox;

    private onTouched = noop;

    private propagateChange = noop;

    constructor(private renderer: Renderer) {
    }

    ngOnInit() {
        if (this.readonly || this.disabled) {
            this.setDisabledState(true);
        }
    }

    toggleCheck(event): void {
        event.stopPropagation();

        this.value = !this.value;
        this.valueChange.emit(this.value);
        this.propagateChange(this.value);
    }

    writeValue(isChecked: boolean): void {
        this.value = Boolean(isChecked);
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.renderer.setElementAttribute(this.checkbox.nativeElement, "disabled", this.disabled ? "disabled" : null);
    }
}
