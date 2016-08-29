/// <reference no-default-lib="true"/>
const {JsonSchemaService} = require("./json-schema.service.ts");
const {draft3, draft4} = require("cwlts/lib");
const Validator = require("jsonschema").Validator;

let jsonSchemaService = new JsonSchemaService({
    draft3: draft3,
    draft4: draft4,
    Validator: Validator
});

class JsonSchemaWorker {

    constructor() {
        onmessage = (e) => {
            let content: string = e.data;
            jsonSchemaService.validateJson(content);
        }
    }
}

// create an instance so this worker actually runs
new JsonSchemaWorker();
