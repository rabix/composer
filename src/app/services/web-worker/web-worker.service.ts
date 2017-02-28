import {Observable} from "rxjs/Observable";
import {Injectable} from "@angular/core";
import {ValidationResponse} from "./json-schema/json-schema.service";
// const JsonSchemaWorker = require("worker-loader?name=json-schema.worker!./json-schema/json-schema.worker.ts");
const JsonSchemaWorker = require("worker-loader!./json-schema/json-schema.worker.ts");

@Injectable()
export class WebWorkerService {

    private jsonSchemaWorker: Worker;
    public validationResultStream: Observable<ValidationResponse>;

    constructor() {
        this.jsonSchemaWorker = new JsonSchemaWorker();

        this.validationResultStream = Observable
            .fromEvent(this.jsonSchemaWorker, "message")
            .map((result: any) => {
                return result.data;
            });

    }

    public validateJsonSchema(jsonText: string): void {
        if (this.jsonSchemaWorker) {
            this.jsonSchemaWorker.postMessage(jsonText);
        }
    }

    //This should be called on the same component where the provider is defined
    public dispose(): void {
        if (this.jsonSchemaWorker) {
            this.jsonSchemaWorker.terminate();
            this.jsonSchemaWorker = undefined;
        }
    }
}
