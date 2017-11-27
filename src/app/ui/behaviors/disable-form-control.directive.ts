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
            this.formControl.disable({onlySelf: true, emitEvent: false});
        } else {
            this.formControl.enable({onlySelf: true, emitEvent: false});
        }

    }
}
