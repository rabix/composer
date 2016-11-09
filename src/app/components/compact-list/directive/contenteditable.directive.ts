import {Directive, ElementRef, forwardRef} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl} from "@angular/forms";

@Directive({
    selector: '[contenteditable]',
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ContenteditableDirective), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ContenteditableDirective), multi: true }
    ],
    host: {
        '(keydown)': 'onKeyDown($event)',
        '(keyup)': 'onKeyUp()'
    }
})
export class ContenteditableDirective implements ControlValueAccessor {

    private onChange = (_) => { };
    private onTouched = () => { };

    private validateFn: any = () => {};

    private lastValue: any;

    constructor(private elRef: ElementRef) {

    }

    private writeValue(value: any): void {
        this.elRef.nativeElement.innerText = value;
        this.onChange(this.elRef.nativeElement.innerText);
    }

    private registerOnChange(fn: (_: any) => void): void {
        this.onChange = fn;
    }

    private registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    private onKeyUp(): void {
        this.lastValue = this.elRef.nativeElement.innerText;
        this.onChange(this.elRef.nativeElement.innerText);
    }

    private onKeyDown(event): void {
        const enterKeyCode = 13;

        //Prevent new lines
        if (event.keyCode === enterKeyCode) {
            event.preventDefault();
        }
    }

    validate(c: FormControl) {
        return this.validateFn(c);
    }
}
