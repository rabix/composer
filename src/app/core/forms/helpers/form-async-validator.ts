import {AbstractControl, ValidationErrors} from "@angular/forms";

export class FormAsyncValidator {

    private static _debounce(fn: (control: AbstractControl) => Promise<any>, time = 300): (control: AbstractControl) => Promise<any> {
        let timeout;

        return (control: AbstractControl) => {
            return new Promise((resolve, reject) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    fn(control).then(resolve, reject);
                }, time);

            });

        };
    }

    static debounceValidator(validator: (control: AbstractControl) => Promise<ValidationErrors | null>, time = 300) {
        return FormAsyncValidator._debounce(validator, time);
    }

}
