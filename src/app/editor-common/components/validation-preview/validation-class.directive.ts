import {Directive, Input} from "@angular/core";
import {Validation} from "cwlts/models/helpers/validation";

@Directive({
    host: {
        "[class.error]": "errors",
        "[class.warning]": "warnings && !errors",
        "[class.validatable]": "'true'"
    },
    selector: "[ct-validation-class]"
})
export class ValidationClassDirective {
    @Input("ct-validation-class")
    entry: Validation;

    get errors() {
        return this.entry ? this.entry.errors.length : false
    }

    get warnings() {
        return this.entry ? this.entry.warnings.length : false
    }
}
