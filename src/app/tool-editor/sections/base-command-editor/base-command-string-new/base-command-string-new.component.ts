import {ChangeDetectionStrategy, Component, OnInit} from "@angular/core";
import {ControlValueAccessor, FormControl} from "@angular/forms";
import {DirectiveBase} from "../../../../util/directive-base/directive-base";

@Component({
    selector: "ct-base-command-string-new",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <input class="form-control"/>
    `,
})
export class BaseCommandStringNewComponent extends DirectiveBase implements OnInit, ControlValueAccessor {

    control: FormControl;

    ngOnInit(): void {

        this.control = new FormControl("");
    }

    writeValue(writeValue: any): void {
        let val = "";
        if(Array.isArray(writeValue)){
            val = writeValue.join(" ");
        }
    }

    registerOnChange(fn: any): void {
    }

    registerOnTouched(fn: any): void {
    }


    setDisabledState(isDisabled: boolean): void {
        isDisabled ? this.control.disable() : this.control.enable();
    }
}
