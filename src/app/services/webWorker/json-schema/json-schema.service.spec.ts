import {it, describe, beforeEach} from "@angular/core/testing";
import {JsonSchemaService} from "./json-schema.service";

const {draft3, draft4} = require("cwlts/lib");

const mockValidationResult =  {
    valid: false
};

class MockValidator {
    validate() {
        return mockValidationResult;
    }
}

describe("JsonSchemaService", () => {
    let jsonSchemaService: JsonSchemaService;

    beforeEach(() => {
        jsonSchemaService = new JsonSchemaService({
            draft3: draft3,
            draft4: draft4,
            Validator: MockValidator
        });
    });

    // The postMessage only exist when the service is inside a webworker instance,
    // so it needs to mocked on the window object
    beforeEach(() => {
        spyOn(window, 'postMessage');
    });

    describe("getJsonSchemaContainer", () => {
        it("Should return the JSON schema container object with all its properties", () => {

            const res1 = jsonSchemaService.getJsonSchemaContainer("draft-3");
            expect(res1).toBe(draft3);

            const res2 = jsonSchemaService.getJsonSchemaContainer("draft-4");
            expect(res2).toBe(draft4);

            const res3 = jsonSchemaService.getJsonSchemaContainer("draft-123");
            expect(res3).toBe(undefined);
        });
    });

    describe("isCwlVersionValid", () => {
        it("Should return true if the CwlVersion is valid", () => {

            const res1 = jsonSchemaService.isCwlVersionValid("draft-3");
            expect(res1).toBe(true);

            const res2 = jsonSchemaService.isCwlVersionValid("draft-4");
            expect(res2).toBe(true);
        });

        it("Should return false if the CwlVersion is not valid", () => {

            const res = jsonSchemaService.isCwlVersionValid("draft-5");
            expect(res).toBe(false);
        });

    });

    describe("isClassValid", () => {
        it("Should return if the CWL class is valid", () => {

            const res1 = jsonSchemaService.isClassValid("Workflow");
            expect(res1).toBe(true);

            const res2 = jsonSchemaService.isClassValid("CommandLineTool");
            expect(res2).toBe(true);

            const res3 = jsonSchemaService.isClassValid("ExpressionTool");
            expect(res3).toBe(true);

            const res4 = jsonSchemaService.isClassValid("InvalidClass");
            expect(res4).toBe(false);

        });
    });

    describe("isValidCwlJson", () => {
        it("Should return false if we pass an undefined value", () => {

            const re1 = jsonSchemaService.isValidCwlJson(undefined);

            expect(window.postMessage).toHaveBeenCalledWith({
                data: undefined,
                isValid: false,
                error: 'JSON is missing "cwlVersion" or "class"'
            });

            expect(re1).toBe(false);
        });

        it("Should return false if we pass an object without 'cwlVersion' or 'class'", () => {

            const res1 = jsonSchemaService.isValidCwlJson({
                prop1: 123,
                prop2: 123
            });
            expect(res1).toBe(false);
        });
    });

    describe("validateJson", () => {
        it("Should call postMessage with an error if the JSON can't be parsed", () => {

            const jsonText = "{this is: not a valid } json 123";

            jsonSchemaService.validateJson(jsonText);

            expect(window.postMessage).toHaveBeenCalledWith({
                data: undefined,
                isValid: false,
                error: jsonText + ' is not a valid JSON'
            });
        });

        it("Should call postMessage with the validator result if the JSON has a valid Class and Version", () => {

            const jsonText = '{"class":"Workflow", "cwlVersion":"draft-3"}';
            jsonSchemaService.validateJson(jsonText);

            expect(window.postMessage).toHaveBeenCalledWith({
                data: mockValidationResult,
                isValid: false
            });
        });
        
        
    });

});
