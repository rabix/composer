import {Directive, ElementRef, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl} from "@angular/forms";

@Directive({
    selector: '[editable]',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EditableDirective), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => EditableDirective), multi: true }
    ],
    host: {
        '(keydown)': 'onKeyDown($event)',
        '(keyup)': 'onKeyUp()'
    }
})
export class EditableDirective implements ControlValueAccessor {

    private propagateChange = (_) => { };
    private onTouched = () => { };

    private validateFn = (_) => {};

    private lastValue: string;

    constructor(private elRef: ElementRef) {

    }

    private writeValue(value: any): void {
        this.elRef.nativeElement.innerText = value;
        this.propagateChange(this.elRef.nativeElement.innerText);
    }

    private registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    private registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    private onKeyUp(): void {
        this.lastValue = this.elRef.nativeElement.innerText;
        this.propagateChange(this.elRef.nativeElement.innerText);
    }

    private onKeyDown(event): void {
        const enterKeyCode = 13;

        //Prevent new lines
        if (event.keyCode === enterKeyCode) {
            event.preventDefault();
        }
    }

    private validate(c: FormControl) {
        return this.validateFn(c);
    }
}
