/// <reference no-default-lib="true"/>
const {JsonSchemaService} = require("./json-schema.service.ts");
const {schemas} = require("cwlts/lib/schemas");
const AJV = require("ajv");

let jsonSchemaService = new JsonSchemaService({
    draft3: schemas.draft3,
    draft4: schemas.draft4,
    draft2: schemas.d2sb,
    validator: new AJV({})
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
