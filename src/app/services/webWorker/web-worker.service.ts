import {ValidationMessage} from "./json-schema.interfaces";
import {Observable} from "rxjs/Rx";

const JsonSchemaWorker = require("worker!./json-schema.worker.ts");

export interface ValidationResponse {
    isValid: boolean,
    errors: Array<any>
    schema: any
}

/* This class should be instantiated (not injected), every instance will have one WebWorker instance. */
export class WebWorkerService {

    jsonSchemaWorker: Worker;

    constructor() {
        this.jsonSchemaWorker = new JsonSchemaWorker();
    }

    private postMessage(jsonText: string) {
        this.jsonSchemaWorker.postMessage(jsonText);
    }

    public validateJsonSchema(jsonText: string): Observable<ValidationResponse> {
        this.postMessage(jsonText);

        //noinspection TypeScriptUnresolvedFunction
        return Observable.fromEventPattern((handler) => {
            this.jsonSchemaWorker.onmessage = e => {
                handler(e);
            }}, () => {})
            .map((res: any) => {
                let responseMessage: ValidationMessage = res.data;
                
                if (responseMessage.error !== undefined) {
                   throw Error(responseMessage.error);
                } else {
                    let isValid = responseMessage.isValid;
                    let errors = responseMessage.data.errors;
                    let schema = responseMessage.data.instance;

                    return {
                        isValid: isValid,
                        errors: errors,
                        schema: schema
                    }
                }
            });
    }
}
