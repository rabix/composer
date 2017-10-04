import {Directive, HostBinding, Input} from "@angular/core";
import {ValidationBase} from "cwlts/models/helpers/validation";

@Directive({
    selector: "[ct-validation-class]"
})
export class ValidationClassDirective {
    @Input("ct-validation-class")
    entry: ValidationBase;

    @HostBinding("class.error")
    get error() {
        return this.entry ? this.entry.errors.length : false;
    }

    @HostBinding("class.warning")
    get warning() {
        return this.entry ? this.entry.warnings.length && !this.error : false;
    }

    @HostBinding("class.validatable")
    validatable = true;
}
