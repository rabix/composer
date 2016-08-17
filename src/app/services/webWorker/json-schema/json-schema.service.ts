//this method is here to avoid linting errors
declare function postMessage(message);

// This class should only be used inside a WebWorker,
// because it relies on the WebWorkers postMessage method
export class JsonSchemaService {
    private draft3;
    private draft4;
    private Validator;

    constructor(attr: {
        draft3: Object,
        draft4: Object,
        Validator: Object
    }) {
        this.draft3 = attr.draft3;
        this.draft4 = attr.draft4;
        this.Validator = attr.Validator;
    }

    getJsonSchemaContainer(versionString: string) {
        switch(versionString) {
            case "draft-3":
                return this.draft3;
            case "draft-4":
                return this.draft4;
        }
    }

    isCwlVersionValid(versionString: string) {
        return versionString === "draft-3" || versionString === "draft-4"
    }

    isClassValid(cwlClass: string) {
        return cwlClass === "Workflow" || cwlClass === "CommandLineTool" || cwlClass === "ExpressionTool";
    }


    isValidCwlJson(json: any) {
        if (json !== undefined && json.cwlVersion && json.class) {

            let isValid = this.isClassValid(json.class) && this.isCwlVersionValid(json.cwlVersion);
            if (!isValid) {
                postMessage({
                    data: undefined,
                    isValid: false,
                    error: 'cwlVersion or class is not valid'
                });
            }

            return isValid;

        } else {
            postMessage({
                data: undefined,
                isValid: false,
                error: 'JSON is missing "cwlVersion" or "class"'
            });

            return false;
        }
    }

    validateJson(jsonText: string) {
        let validator = new this.Validator();
        let cwlJson: {cwlVersion: string, class: string} = undefined;
        let cwlVersion = undefined;
        let jsonClass = undefined;

        try {
            cwlJson = JSON.parse(jsonText);
        } catch (e) {
            postMessage({
                data: undefined,
                isValid: false,
                error: jsonText + ' is not a valid JSON'
            });
        }

        if (cwlJson !== undefined && this.isValidCwlJson(cwlJson)) {
            cwlVersion = cwlJson.cwlVersion;
            jsonClass = cwlJson.class;

            let schemaContainer = this.getJsonSchemaContainer(cwlVersion);
            let result: any;

            switch(jsonClass) {
                case 'Workflow':
                    result = validator.validate(cwlJson, schemaContainer.wfSchema);
                    break;
                case 'CommandLineTool':
                    result = validator.validate(cwlJson, schemaContainer.cltSchema);
                    break;
                case 'ExpressionTool':
                    result = validator.validate(cwlJson, schemaContainer.etSchema);
                    break;
            }

            postMessage({
                data: result,
                isValid: result.valid
            });
        }
    }
}
