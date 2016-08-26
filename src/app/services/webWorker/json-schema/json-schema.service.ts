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
    private draft3;
    private draft4;
    private Validator;
    private errorMessage: string;

    constructor(attr: {
        draft3: Object,
        draft4: Object,
        Validator: Object
    }) {
        this.draft3 = attr.draft3;
        this.draft4 = attr.draft4;
        this.Validator = attr.Validator;
    }

    public getJsonSchemaContainer(versionString: string) {
        switch(versionString) {
            case "draft-3":
                return this.draft3;
            case "draft-4":
                return this.draft4;
        }
    }

    public isCwlVersionValid(versionString: string) {
        return versionString === "draft-3" || versionString === "draft-4"
    }

    public isClassValid(cwlClass: string) {
        return cwlClass === "Workflow" || cwlClass === "CommandLineTool" || cwlClass === "ExpressionTool";
    }


    public isValidCwlJson(json: any) {
        if (json !== undefined && json.cwlVersion && json.class) {

            const isValid = this.isClassValid(json.class) && this.isCwlVersionValid(json.cwlVersion);
            if (!isValid) {
                this.errorMessage = "cwlVersion or class is not valid";
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

        if (!this.isValidCwlJson(cwlJson) && this.errorMessage) {
            this.sendErrorMessage(this.errorMessage);
        } else {
            cwlVersion = cwlJson.cwlVersion;
            jsonClass = cwlJson.class;

            const schemaContainer = this.getJsonSchemaContainer(cwlVersion);
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
