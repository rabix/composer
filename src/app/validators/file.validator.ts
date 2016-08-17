import {AsyncValidatorFn} from "@angular/forms";
import {FileApi} from "../services/api/file.api";
import {Injector, Injectable} from "@angular/core";
import {Observable, Subject} from "rxjs/Rx";
import {AbstractControl} from "@angular/common";

@Injectable()
export class FileValidator {

    public constructor(private fileApi: FileApi) {
    }

    public static fromInjector(injector: Injector): FileValidator {
        return new FileValidator(injector.get(FileApi));
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
