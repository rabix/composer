import {Directive, ElementRef, forwardRef} from "@angular/core";
import {ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR} from "@angular/forms";
import {noop} from "../../lib/utils.lib";

// @deprecated
@Directive({
    selector: "[ct-editable][contenteditable=true]",
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditableDirective), multi: true},
        {provide: NG_VALIDATORS, useExisting: forwardRef(() => EditableDirective), multi: true}
    ],
    host: {
        "(keydown)": "onKeyDown($event)",
        "(keyup)": "onKeyUp()"
    }
})
export class EditableDirective implements ControlValueAccessor {


    private propagateChange = noop;
    private onTouched       = noop;

    private validateFn = noop;

    private lastValue: string;

    constructor(private elRef: ElementRef) {
    }

    writeValue(value: any): void {
        this.elRef.nativeElement.innerText = value;
        this.propagateChange(this.elRef.nativeElement.innerText);
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private onKeyUp(): void {
        this.lastValue = this.elRef.nativeElement.innerText;
        this.propagateChange(this.elRef.nativeElement.innerText);
    }

    private onKeyDown(event): void {
        const enterKeyCode = 13;

        // Prevent new lines
        if (event.keyCode === enterKeyCode) {
            event.preventDefault();
        }
    }

    validate(c: FormControl) {
        return this.validateFn(c);
    }
}
