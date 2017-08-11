import {Injectable} from "@angular/core";
import {AbstractControl} from "@angular/forms";

@Injectable()
export class CustomValidators {
    static cwlModel = (c: AbstractControl) => {
        const val = c.value;
        let res: any = {};

        if (!val || !val.validation) return null;

        if (val.validation.errors.length) {
            res.errors = val.validation.errors;
        }

        if (val.validation.warnings.length) {
            res.warnings = val.validation.warnings;
        }

        return res.errors || res.warnings ? res : null;
    }
}
