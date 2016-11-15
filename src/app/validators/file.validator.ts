import {AsyncValidatorFn, AbstractControl} from "@angular/forms";
import {Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs/Rx";

@Injectable()
export class FileValidator {

    public constructor() {
    }


    public uniqueFilename(c: AbstractControl): AsyncValidatorFn {
        const valueChanges = new Subject();

        return (_: AbstractControl) => {
            return c.valueChanges.debounceTime(1000).flatMap(value => {
                return Observable.of(value === "hello" ? null : {name: "Name must be hello"});
            });

        };

    }

    public static ufi(c: AbstractControl): AsyncValidatorFn {
        return null;
    }


}
