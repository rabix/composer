import {
    Component, forwardRef, Input, ViewChild, Renderer, Output, EventEmitter,
    ChangeDetectionStrategy
} from "@angular/core";
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";

require("./toggle-slider.component.scss");

@Component({
    selector: "ct-toggle-slider",
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleComponent), multi: true }
    ],
    template: `
            <span>{{ value ? on : off }}</span>
    
            <label class="switch">
                <input #checkbox type="checkbox" [checked]="value" (change)="toggleCheck($event)" [disabled]="isDisabled">
                <div class="slider round" [class.disabled]="isDisabled"></div>
            </label>
    `
})
export class ToggleComponent implements ControlValueAccessor {

    private isDisabled: boolean = false;

    @Input()
    public on = "On";

    @Input()
    public off = "Off";

    @Input()
    public value = false;

    @Input()
    public disabled = false;

    @Output()
    public change = new EventEmitter();

    @ViewChild('checkbox') checkbox;

    constructor(private renderer: Renderer) {
    }

    ngOnInit() {
        if (this.readonly) {
            this.setDisabledState(true);
        }
    }

    private onTouched = () => { };

    private propagateChange = (_) => {};

    private toggleCheck(event): void {
        event.stopPropagation();

        this.value = !this.value;
        this.change.emit(this.value);
        this.propagateChange(this.value);
    }

    ngOnInit() {
        this.setDisabledState(this.disabled);
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

    setDisabledState(isDisabled: boolean): void {
        this.isDisabled = isDisabled;
        this.renderer.setElementAttribute(this.checkbox.nativeElement, 'disabled', this.isDisabled ? "disabled" : null);
    }
}
