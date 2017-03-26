import {Directive, Input} from "@angular/core";
import {FormControl} from "@angular/forms";

@Directive({
    selector: "[formControl][ct-disabled]"
})
export class DisableFormControlDirective {
    @Input() formControl: FormControl;

    @Input("ct-disabled") set disableControl(s: boolean) {
        if (!this.formControl) {
            return;
        } else if (s) {
            this.formControl.disable();
        } else {
            this.formControl.enable();
        }

    }
}
