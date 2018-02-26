import {Injectable} from "@angular/core";
import {Issue} from "cwlts/models/helpers/validation";
import {Observable} from "rxjs/Observable";
import {CwlSchemaValidationWorkerService} from "../cwl-schema-validation-worker/cwl-schema-validation-worker.service";
import {switchMap} from "rxjs/operators";
import {fromPromise} from "rxjs/observable/fromPromise";

export interface AppValidityState {
    isValidCWL: boolean,
    isInvalid: boolean,
    isPending: boolean,
    errors: Issue[],
    warnings: Issue[],
}

@Injectable()
export class AppValidatorService {

    constructor(private cwlWorker: CwlSchemaValidationWorkerService) {
    }

    createValidator(contentStream: Observable<string>): Observable<AppValidityState> {

        const output = {
            isValidCWL: false,
            isPending: true,
            errors: [],
            warnings: []
        } as AppValidityState;

        const subs          = [];
        const preValidation = contentStream;

        const validation = preValidation.pipe(
            switchMap(content => fromPromise(this.cwlWorker.validate(content)))
        );

        return new Observable(obs => {
            subs.push(
                preValidation.subscribe(_ => obs.next(Object.assign({}, output, {
                    isValidCWL: false,
                    isPending: true,
                } as AppValidityState)), (err) => {
                    obs.error(err);
                }),

                validation.subscribe(val => obs.next(Object.assign(output, {
                    isValidCWL: val.isValidCWL,
                    isPending: false,
                    errors: val.errors,
                    warnings: val.warnings
                } as AppValidityState)), (err) => {
                    obs.error(err);
                }));

            return () => subs.forEach(sub => sub.unsubscribe());

        });


    }
}
