//this method is here to avoid linting errors
declare function postMessage(message);

export interface ValidationResponse {
    isValidatableCwl: boolean,
    isValidCwl: boolean,
    errors: Array<any>,
    warnings: Array<any>
}

// This class should only be used inside a WebWorker,
// because it relies on the WebWorkers postMessage method
export class JsonSchemaService {
    private validator;
    private errorMessage: string;

    constructor(attr: {
        draft3: any,
        draft4: any,
        draft2: any,
        validator: any
    }) {
        this.validator = attr.validator;

        const schemas = {
            "draft-2": {
                CommandLineTool: attr.draft2.cltSchema,
                Workflow: attr.draft2.wfSchema,
                ExpressionTool: attr.draft2.etSchema
            },
            "draft-3": {
                CommandLineTool: attr.draft3.cltSchema,
                Workflow: attr.draft3.wfSchema,
                ExpressionTool: attr.draft3.etSchema
            },
            "draft-4": {
                CommandLineTool: attr.draft3.cltSchema,
                Workflow: attr.draft3.wfSchema,
                ExpressionTool: attr.draft3.etSchema
            }
        };

        Object.keys(schemas).forEach((key) => {
            this.validator.addSchema(schemas[key].CommandLineTool, key + "CommandLineTool");
            this.validator.addSchema(schemas[key].Workflow, key + "Workflow");
            this.validator.addSchema(schemas[key].ExpressionTool, key + "ExpressionTool");
        })
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
            this.errorMessage = "JSON is missing 'class' property";
            return false;
        }
    }

    public validateJson(jsonText: string) {
        const validator = this.validator;

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

            let result:any = {};

            result.valid = validator.validate(cwlVersion + jsonClass, cwlJson);
            result.errors = validator.errors;
            result.errorText = validator.errorsText();
            result.class = jsonClass;

            console.log("json schema service result", result);
            this.sendValidationResult(result);
        }
    }

    private sendErrorMessage(errorMessage: string) {
        postMessage({
            isValidatableCwl: false,
            isValidCwl: false,
            errors: [errorMessage],
            warnings: []
        });
    }

    private sendValidationResult(result: any) {
        postMessage({
            isValidatableCwl: true,
            isValidCwl: result.valid,
            errors: result.errors || [],
            warnings: [],
            errorText: result.errorText,
            class: result.class,
        });
    }
}
