import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnInit,
    Output,
    Renderer,
    ViewChild,
    ViewEncapsulation
} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {noop} from "../../lib/utils.lib";
/**
 * @FIXME rename to ToggleSlider or rename the file
 */
@Component({
    encapsulation: ViewEncapsulation.None,

    selector: "ct-toggle-slider",
    styleUrls: ["./toggle-slider.component.scss"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ToggleComponent), multi: true}
    ],
    template: `
        <span>{{ on ? on : "" }}</span>

        <label class="switch">
            <input #checkbox type="checkbox" [checked]="value" (change)="toggleCheck($event)" [disabled]="disabled">
            <div class="slider round" [class.disabled]="disabled"></div>
        </label>
    `
})
export class ToggleComponent implements ControlValueAccessor, OnInit {

    isDisabled = false;

    @Input()
    readonly = false;

    @Input()
    on: string;

    @Input()
    off: string;

    @Input()
    value = false;

    @Input()
    disabled = false;

    @Output()
    change = new EventEmitter();

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
        this.change.emit(this.value);
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

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        this.renderer.setElementAttribute(this.checkbox.nativeElement, "disabled", this.disabled ? "disabled" : null);
    }
}
