import {Injectable} from "@angular/core";
import {Issue} from "cwlts/models/helpers/validation";
import {Observable} from "rxjs/Observable";
import {CwlSchemaValidationWorkerService} from "../cwl-schema-validation-worker/cwl-schema-validation-worker.service";

export interface AppValidityState {
    isValid: boolean,
    isInvalid: boolean,
    isPending: boolean,
    errors: Issue[],
    warnings: Issue[]
}

@Injectable()
export class AppValidatorService {

    constructor(private cwlWorker: CwlSchemaValidationWorkerService) {
    }

    createValidator(contentStream: Observable<string>): Observable<AppValidityState> {

        const output = {
            isValid: false,
            isInvalid: false,
            isPending: true,
            errors: [],
            warnings: []
        };

        const subs          = [];
        const preValidation = contentStream;
        const validation    = preValidation.switchMap(content => {
            return Observable.fromPromise(this.cwlWorker.validate(content));
        });

        return new Observable(obs => {
            subs.push(
                preValidation.subscribe(_ => obs.next(Object.assign({}, output, {
                    isValid: false,
                    isInvalid: false,
                    isPending: true,
                }))),

                validation.subscribe(val => obs.next(Object.assign(output, {
                    isValid: val.isValidCWL,
                    isInvalid: !val.isValidCWL,
                    isPending: false,
                    errors: val.errors,
                    warnings: val.warnings
                }))));


            return () => subs.forEach(sub => sub.unsubscribe());

        });


    }
}
