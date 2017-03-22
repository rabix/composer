import {Component, OnInit, ChangeDetectionStrategy, forwardRef, Input} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {SelectComponent} from "./select/select.component";
import {Subject} from "rxjs/Subject";

@Component({
    selector: "ct-auto-complete",
    providers: [
        {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AutoCompleteComponent), multi: true}
    ],
    template: `
        <input #el [placeholder]="placeholder">
    `,
    styleUrls: ["./auto-complete.component.scss"],
})
export class AutoCompleteComponent extends SelectComponent implements ControlValueAccessor, OnInit {

    // Important inputs -> [options], [create], see parent class...

    // True makes control mono-selection (suggested input)
    @Input()
    public mono = false;

    @Input()
    public placeholder = "";

    private update = new Subject();

    private onTouched = () => {
    }

    private propagateChange = (_) => {
    }

    ngOnInit() {
        if (this.mono) {
            this.maxItems = 1;
        }

        this.update.distinctUntilChanged().subscribe((value) => {
            this.propagateChange(value);
        });
    }

    writeValue(obj: any): void {
        this.updateOptions(obj ? obj : []);
    }

    onChange(value: string) {
        this.update.next(this.mono ? value : value.split(this.delimiter));
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }
}

