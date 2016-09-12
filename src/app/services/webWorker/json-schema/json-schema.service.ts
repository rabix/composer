//this method is here to avoid linting errors
declare function postMessage(message);

export interface ValidationResponse {
    isValidatableCwl: boolean,
    isValidCwl: boolean,
    errors: Array<any>
    schema: any
}

// This class should only be used inside a WebWorker,
// because it relies on the WebWorkers postMessage method
export class JsonSchemaService {
    private Validator;
    private errorMessage: string;
    private schemas: {
        "draft-2": any,
        "draft-3": any,
        "draft-4": any
    };

    constructor(attr: {
        draft3: Object,
        draft4: Object,
        draft2: Object,
        Validator: Object
    }) {
        this.Validator = attr.Validator;

        this.schemas = {
            "draft-2": attr.draft2,
            "draft-3": attr.draft3,
            "draft-4": attr.draft4
        }
    }

    public isClassValid(cwlClass: string) {
        return cwlClass === "Workflow" || cwlClass === "CommandLineTool" || cwlClass === "ExpressionTool";
    }


    public isValidCWLClass(json: any) {
        if (json !== undefined && json.class) {

            const isValid = this.isClassValid(json.class);

            if (!isValid) {
                this.errorMessage = "CWL Class is not valid";
            }

            return isValid;

        } else {
            this.errorMessage = "JSON is missing 'cwlVersion' or 'class'";
            return false;
        }
    }

    public validateJson(jsonText: string) {
        const validator = new this.Validator();
        let cwlJson: {cwlVersion: string, class: string};
        let cwlVersion;
        let jsonClass;

        try {
            cwlJson = JSON.parse(jsonText);
        } catch (e) {
            this.sendErrorMessage("Not a valid JSON");
            return;
        }

        if (!this.isValidCWLClass(cwlJson) && this.errorMessage) {
            this.sendErrorMessage(this.errorMessage);
        } else {
            cwlVersion = cwlJson.cwlVersion || 'draft-2';
            jsonClass = cwlJson.class;

            const schemaContainer = this.schemas[cwlVersion];
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

            this.sendValidationResult(result);
        }
    }

    private sendErrorMessage(errorMessage: string) {
        postMessage({
            isValidatableCwl: false,
            isValidCwl: false,
            errors: [errorMessage],
            schema: undefined
        });
    }

    private sendValidationResult(result: any) {
        postMessage({
            isValidatableCwl: true,
            isValidCwl: result.valid,
            errors: result.errors,
            schema: result.instance
        });
    }
}
