/// <reference no-default-lib="true"/>
import {ValidationMessage} from "./json-schema.interfaces";
import {draft3, draft4} from "cwlts/lib";

let Validator = require('jsonschema').Validator;

declare function postMessage(message: ValidationMessage): void;

class JsonSchemaWorker {

    constructor() {
        onmessage = (e) => {
            let requestObj: string = e.data;
            this.validateJson(requestObj);
        }
    }
    
    getJsonSchemaContainer(versionString: string) {
        switch(versionString) {
            case "draft-3":
                return draft3;
            case "draft-4":
                return draft4;
        }
    }

    isCwlVersionValid(versionString: string) {
        return versionString === "draft-3" || versionString === "draft-4"
    }

    isClassValid(cwlClass: string) {
        return cwlClass === "Workflow" || cwlClass === "CommandLineTool" || cwlClass === "ExpressionTool";
    }


    isValidCwlJson(json: any) {
        if (json !== null && json.cwlVersion && json.class) {

            let isValid = this.isClassValid(json.class) && this.isCwlVersionValid(json.cwlVersion);
            if (!isValid) {
                postMessage({
                    data: null,
                    isValid: false,
                    error: 'cwlVersion or class is not valid'
                });
            }

            return isValid;

        } else {
            postMessage({
                data: null,
                isValid: false,
                error: 'JSON is missing "cwlVersion" or "class"'
            });

            return false;
        }
    }

    validateJson(jsonText: string) {
        let validator = new Validator();
        let json = null;
        let cwlVersion = null;
        let jsonClass = null;

        try {
            json = JSON.parse(jsonText);
        } catch (e) {
            postMessage({
                data: null,
                isValid: false,
                error: jsonText + ' is not a valid JSON'
            });
        }

        if (json !== null && this.isValidCwlJson(json)) {
            cwlVersion = json.cwlVersion;
            jsonClass = json.class;

            let schemaContainer = this.getJsonSchemaContainer(cwlVersion);
            let result: any;

            switch(jsonClass) {
                case 'Workflow':
                    result = validator.validate(json, schemaContainer.wfSchema);
                    break;
                case 'CommandLineTool':
                    result = validator.validate(json, schemaContainer.cltSchema);
                    break;
                case 'ExpressionTool':
                    result = validator.validate(json, schemaContainer.etSchema);
                    break;
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
