import {Observable} from "rxjs/Observable";
const JsonSchemaWorker = require("worker!./json-schema/json-schema.worker.ts");

/* This class should be instantiated (not injected), every instance will have one WebWorker instance. */
export class WebWorkerService {

    private jsonSchemaWorker: Worker;
    public validationResultStream: Observable<any>;

    constructor() {
        this.jsonSchemaWorker = new JsonSchemaWorker();
        this.validationResultStream = Observable.fromEvent(this.jsonSchemaWorker, 'message');
    }

    public validateJsonSchema(jsonText: string) {
        this.jsonSchemaWorker.postMessage(jsonText);
    }
}
