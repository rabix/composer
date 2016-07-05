import {ValidationMessage} from "./json-schema.interfaces";
import {Observable} from "rxjs/Rx";

let JsonSchemaWorker = require("worker!./json-schema.worker.ts");

export interface ValidationResponse {
    isValid: boolean,
    errors: Array<any>
    schema: any
}

export class WebWorkerService {

    jsonSchemaWorker: Worker;

    constructor() {
        this.jsonSchemaWorker = new JsonSchemaWorker();
    }

    private postMessage(jsonText: string) {
        this.jsonSchemaWorker.postMessage(jsonText)
    }

    public validateJsonSchema(jsonText: string): Observable<ValidationResponse> {

        this.postMessage(jsonText);

        //noinspection TypeScriptUnresolvedFunction
        return Observable.fromEvent(this.jsonSchemaWorker, 'message')
            .map((res: any) => {
                let responseMessage: ValidationMessage = res.data;
                
                let isValid = responseMessage.isValid;
                let errors = responseMessage.data.errors;
                let schema = responseMessage.data.schema;

                return {
                    isValid: isValid,
                    errors: errors,
                    schema: schema
                }
            });
    }
}
