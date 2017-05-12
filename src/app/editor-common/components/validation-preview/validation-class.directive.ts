import {Directive, HostBinding, Input, OnChanges} from "@angular/core";
import {ValidationBase} from "cwlts/models/helpers/validation";

@Directive({
    selector: "[ct-validation-class]"
})
export class ValidationClassDirective implements OnChanges {
    @Input("ct-validation-class")
    entry: ValidationBase;

    @HostBinding("class.error")
    error = false;

    @HostBinding("class.warning")
    warning = false;

    @HostBinding("class.validatable")
    validatable = true;

    ngOnChanges(): void {
        if (this.entry && this.entry instanceof ValidationBase) {
            this.error   = this.entry.hasErrors;
            this.warning = this.entry.hasWarnings && !this.error;
        }
    }

}
