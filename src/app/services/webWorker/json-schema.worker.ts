/// <reference no-default-lib="true"/>
import {ValidationMessage} from "./json-schema.interfaces";

let Validator = require('jsonschema').Validator;

//TODO: change the cwlts to have a method that returns the schemas
let draft3 = {
    cltSchema: require("../../../../node_modules/cwlts/src/parser/schemas/draft-3/CLT-schema.json"),
    wfSchema: require("../../../../node_modules/cwlts/src/parser/schemas/draft-3/WF-schema.json"),
    etSchema: require("../../../../node_modules/cwlts/src/parser/schemas/draft-3/ET-schema.json")
};

let draft4 = {
    cltSchema: require("../../../../node_modules/cwlts/src/parser/schemas/draft-4/CLT-schema.json"),
    wfSchema: require("../../../../node_modules/cwlts/src/parser/schemas/draft-4/WF-schema.json"),
    etSchema: require("../../../../node_modules/cwlts/src/parser/schemas/draft-4/ET-schema.json")
};


declare function postMessage(message: ValidationMessage): void;

class JsonSchemaWorker {

    constructor() {
        onmessage = (e) => {
            let requestObj: string = e.data;
            this.validateJson(requestObj);
        }
    }
    
    
    //TODO: maybe move this to the cwlts
    private getJsonSchemaContainer(versionString: string) {
        switch(versionString) {
            case "draft-3":
                return draft3;
            case "draft-4":
                return draft4;
        }
    }

    private isCwlVersionValid(versionString: string) {
        return versionString === "draft-3" || versionString === "draft-4"
    }

    private isClassValid(cwlClass: string) {
        return cwlClass === "Workflow" || cwlClass === "CommandLineTool" || cwlClass === "ExpressionTool";
    }

    private isValidCwlJson(json: any) {
        if (json !== null && json.cwlVersion && json.class) {
            return this.isClassValid(json.class) && this.isCwlVersionValid(json.cwlVersion);
        } else {
            console.log('JSON is missing "cwlVersion" or "class"');
            return false;
        }
    }

    private validateJson(jsonText: string) {
        let validator = new Validator();
        let json = null;
        let cwlVersion = null;
        let jsonClass = null;

        try {
            json = JSON.parse(jsonText);
        } catch (e) {
            console.log(jsonText + ' is not a valid JSON');
        }

        if (json !== null && this.isValidCwlJson(json)) {
            cwlVersion = json.cwlVersion;
            jsonClass = json.class;

            let schemaContainer = this.getJsonSchemaContainer(cwlVersion);
            let result: any;
            
            switch(jsonClass) {
                case 'Workflow':
                    result = validator.validate(json, schemaContainer.wfSchema);
                case 'CommandLineTool':
                    result = validator.validate(json, schemaContainer.cltSchema);
                case 'ExpressionTool':
                    result = validator.validate(json, schemaContainer.etSchema);
            }

            postMessage({
                data: result,
                isValid: result.valid
            });

        }
    }
}

// create an instance so this worker actually runs
new JsonSchemaWorker();
