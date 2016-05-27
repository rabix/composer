import {NG_ASYNC_VALIDATORS, Control} from '@angular/common';
import {forwardRef, provide, Directive} from '@angular/core';
import {FileApi} from "../services/api/file.api";

//This directive was meant to work with Observable, but Async Validators don't work with Observables yet.
@Directive({
    selector: '[validateFileExists][ngControl]',
    providers: [
        // makes validator available for anybody using NG_ASYNC_VALIDATORS
        provide(NG_ASYNC_VALIDATORS, {
            useExisting: forwardRef(() => FileExistsValidator),
            multi: true
        })
    ]
})
class FileExistsValidator {
    validator: Function;

    // should create validation function
    constructor(private fileApi: FileApi) {
        // this.controlDataInput..map((controlValue: any) => {
        //     console.log("Checking: " + controlValue);
        //     return {
        //         foo: "bar"
        //     }
        // });
        //
        // let validationFunction = function(fileApi: FileApi) {
        //     console.log('inside validation wrapper');
        //     return (control: Control): Observable<ValidationResult> => {
        //
        //         console.log('inside validation function');
        //         return new Observable((observer: Observer) => {
        //
        //             control.valueChanges.debounceTime(500).flatMap(value => {
        //                 console.log('got some value', value);
        //                 return fileApi.checkIfFileExists(value)
        //
        //             }).do(value => {
        //                 console.log('got some value from API');
        //             }).subscribe(data => {
        //                 console.log('got data', data);
        //
        //                 if (data) {
        //                     observer.next({
        //                         fileExists: true
        //                     });
        //                 } else {
        //                     observer.next(null);
        //                 }
        //                 observer.complete();
        //             }, err => {
        //                 observer.next(null);
        //                 observer.complete();
        //             })
        //         });
        //     };
        // };
        //
        // this.validator = validationFunction(fileApi);
    }

    // should return Promise or Observable (see note above)
    public validate(control: Control) {

        // return this.validator(control);
        //
        // let prom = new Promise((resolve, reject) => {
        //     console.log("Triggering");
        //     resolve(control.value === "asdf" ? {
        //         foo: "bar"
        //     } : null)
        // });
    }
}