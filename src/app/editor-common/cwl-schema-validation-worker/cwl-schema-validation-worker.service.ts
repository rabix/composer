import {Injectable} from "@angular/core";
import {Issue} from "cwlts/models/helpers/validation";

import * as cwlSchemas from "cwlts/schemas";
import {WebWorker} from "../../core/web-worker/web-worker";
import {WebWorkerBuilderService} from "../../core/web-worker/web-worker-builder.service";

declare const jsyaml;
declare const Ajv;

export interface ValidationResponse {
    isValidatableCWL: boolean;
    isValidCWL: boolean;
    isValidJSON: boolean;
    errors: Issue[];
    warnings: Issue[];
    class?: string | "CommandLineTool" | "Workflow" | "ExpressionTool";
}

@Injectable()
export class CwlSchemaValidationWorkerService {

    private worker: WebWorker<any>;

    private draft4;

    private cwlSchema = cwlSchemas.schemas.mixed;


    constructor(private workerBuilder: WebWorkerBuilderService) {

        this.worker = this.workerBuilder.create(this.workerFunction, [
            "ajv.min.js",
            "js-yaml.min.js"
        ], {
            cwlSchema: this.cwlSchema,
            // FIXME: will not work in browser, window.require call
            draft4: {
                "id": "http://json-schema.org/draft-04/schema#",
                "$schema": "http://json-schema.org/draft-04/schema#",
                "description": "Core schema meta-schema",
                "definitions": {
                    "schemaArray": {
                        "type": "array",
                        "minItems": 1,
                        "items": {"$ref": "#"}
                    },
                    "positiveInteger": {
                        "type": "integer",
                        "minimum": 0
                    },
                    "positiveIntegerDefault0": {
                        "allOf": [{"$ref": "#/definitions/positiveInteger"}, {"default": 0}]
                    },
                    "simpleTypes": {
                        "enum": ["array", "boolean", "integer", "null", "number", "object", "string"]
                    },
                    "stringArray": {
                        "type": "array",
                        "items": {"type": "string"},
                        "minItems": 1,
                        "uniqueItems": true
                    }
                },
                "type": "object",
                "properties": {
                    "id": {
                        "type": "string",
                        "format": "uri"
                    },
                    "$schema": {
                        "type": "string",
                        "format": "uri"
                    },
                    "title": {
                        "type": "string"
                    },
                    "description": {
                        "type": "string"
                    },
                    "default": {},
                    "multipleOf": {
                        "type": "number",
                        "minimum": 0,
                        "exclusiveMinimum": true
                    },
                    "maximum": {
                        "type": "number"
                    },
                    "exclusiveMaximum": {
                        "type": "boolean",
                        "default": false
                    },
                    "minimum": {
                        "type": "number"
                    },
                    "exclusiveMinimum": {
                        "type": "boolean",
                        "default": false
                    },
                    "maxLength": {"$ref": "#/definitions/positiveInteger"},
                    "minLength": {"$ref": "#/definitions/positiveIntegerDefault0"},
                    "pattern": {
                        "type": "string",
                        "format": "regex"
                    },
                    "additionalItems": {
                        "anyOf": [
                            {"type": "boolean"},
                            {"$ref": "#"}
                        ],
                        "default": {}
                    },
                    "items": {
                        "anyOf": [
                            {"$ref": "#"},
                            {"$ref": "#/definitions/schemaArray"}
                        ],
                        "default": {}
                    },
                    "maxItems": {"$ref": "#/definitions/positiveInteger"},
                    "minItems": {"$ref": "#/definitions/positiveIntegerDefault0"},
                    "uniqueItems": {
                        "type": "boolean",
                        "default": false
                    },
                    "maxProperties": {"$ref": "#/definitions/positiveInteger"},
                    "minProperties": {"$ref": "#/definitions/positiveIntegerDefault0"},
                    "required": {"$ref": "#/definitions/stringArray"},
                    "additionalProperties": {
                        "anyOf": [
                            {"type": "boolean"},
                            {"$ref": "#"}
                        ],
                        "default": {}
                    },
                    "definitions": {
                        "type": "object",
                        "additionalProperties": {"$ref": "#"},
                        "default": {}
                    },
                    "properties": {
                        "type": "object",
                        "additionalProperties": {"$ref": "#"},
                        "default": {}
                    },
                    "patternProperties": {
                        "type": "object",
                        "additionalProperties": {"$ref": "#"},
                        "default": {}
                    },
                    "dependencies": {
                        "type": "object",
                        "additionalProperties": {
                            "anyOf": [
                                {"$ref": "#"},
                                {"$ref": "#/definitions/stringArray"}
                            ]
                        }
                    },
                    "enum": {
                        "type": "array",
                        "minItems": 1,
                        "uniqueItems": true
                    },
                    "type": {
                        "anyOf": [
                            {"$ref": "#/definitions/simpleTypes"},
                            {
                                "type": "array",
                                "items": {"$ref": "#/definitions/simpleTypes"},
                                "minItems": 1,
                                "uniqueItems": true
                            }
                        ]
                    },
                    "allOf": {"$ref": "#/definitions/schemaArray"},
                    "anyOf": {"$ref": "#/definitions/schemaArray"},
                    "oneOf": {"$ref": "#/definitions/schemaArray"},
                    "not": {"$ref": "#"}
                },
                "dependencies": {
                    "exclusiveMaximum": ["maximum"],
                    "exclusiveMinimum": ["minimum"]
                },
                "default": {}
            }

        });
    }

    validate(content: string): Promise<ValidationResponse> {
        return this.worker.request(content);
    }

    destroy() {
        this.worker.terminate();
    }

    private workerFunction(content) {

        let json;
        const cwlSchema = this.cwlSchema;
        const response  = {
            isValidatableCWL: false,
            isValidCWL: false,
            isValidJSON: false,
            errors: [{message: "Not valid file format", loc: "document"}],
            warnings: [],
            class: null
        };

        // First check if this is json or yaml content
        try {
            const warnings = [];
            json           = jsyaml.safeLoad(content, {
                json: true, onWarning: (warn) => {
                    warnings.push({
                        loc: "document",
                        message: warn.message
                    });
                }
            } as any);

            response.isValidJSON = true;
            response.errors      = [];
            response.warnings    = warnings;
        } catch (e) {
            return response;
        }

        // Then check if it has the class prop
        if (!json || !json.class) {
            return Object.assign(response, {
                errors: [{
                    loc: "document",
                    message: "Document is missing the “class” property."
                }]
            });
        }

        // Check if the class is a valid one
        if (["Workflow", "CommandLineTool", "ExpressionTool"].indexOf(json.class) === -1) {
            return Object.assign(response, {
                errors: [{
                    loc: "document",
                    message: "CWL class is not valid. Expected “Workflow”, “CommandLineTool” or “ExpressionTool”."
                }]
            });
        }

        response.isValidatableCWL = true;
        response.class            = json.class;

        const cwlVersion = json.cwlVersion || "sbg:draft-2";
        const ajv        = new Ajv();
        ajv.addMetaSchema(this.draft4);

        let validation = false;
        let errors     = [];
        let warnings   = [];

        if (["sbg:draft-2", "v1.0"].indexOf(cwlVersion) !== -1) {
            validation = ajv.validate(cwlSchema, json);
            errors     = ajv.errors || [];
        } else {
            warnings = [{
                message: `unsupported cwlVersion "${cwlVersion}", expected "v1.0" or "sbg:draft-2"`,
                loc: "document"
            }];
        }

        return Object.assign(response, {
            isValidCWL: validation,
            warnings: warnings,
            errors: errors.map(err => {
                let message = err.message;
                if (err.keyword === "enum") {
                    message += ": " + err.params.allowedValues;
                }

                return {
                    message: message,
                    loc: `document${err.dataPath}`
                };
            }).reduce((acc, curr) => {
                acc = acc.filter(err => {
                    return err.message !== curr.message || err.loc !== curr.loc;
                });

                acc.push(curr);

                return acc;
            }, [])
        });


    }

}
