import {ChangeDetectionStrategy, Component, EventEmitter, forwardRef, Input, Output} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {DirectiveBase} from "../../../util/directive-base/directive-base";

@Component({
    selector: "ct-search-field",
    template: `
        <div class="form-group m-0">

            <i class="icon fa fa-fw fa-search"></i>
            <input #input class="form-control"
                   [attr.data-test]="dataTest"
                   [attr.placeholder]="placeholder"
                   [value]="value"
                   (keyup)="valueChange.emit(input.value); onChange(input.value)"
            />
        </div>
    `,
    styleUrls: ["./search-field.component.scss"],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => SearchFieldComponent),
            multi: true
        }
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchFieldComponent extends DirectiveBase implements ControlValueAccessor {

    @Input()
    placeholder = "Search...";

    @Input()
    value = "";

    @Input()
    dataTest = "";

    @Output()
    valueChange = new EventEmitter<string>();

    onChange: (content: string) => void;
    onTouch: () => void;

    update(val) {
        this.onChange(val);
    }

    writeValue(content: any): void {
        this.value = content;
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }
}
