// import {JsonSchemaService} from "./json-schema.service";
//
// const {schemas} = require("cwlts/schemas");
//
// class MockValidator {
//     validate(jsonSchema) {
//         return {npm rn
//             valid: false,
//             errors: ["mockValidationErrorMessage"],
//             instance: jsonSchema
//         };
//     }
// }
//
// describe("JsonSchemaService", () => {
//     let jsonSchemaService: JsonSchemaService;
//
//     beforeEach(() => {
//         jsonSchemaService = new JsonSchemaService({
//             draft3: schemas.draft3,
//             draft4: schemas.draft4,
//             draft2: schemas.draft2,
//             validator: MockValidator
//         });
//     });
//
//     // The postMessage only exist when the service is inside a webworker instance,
//     // so it needs to mocked on the window object
//     beforeEach(() => {
//         spyOn(window, 'postMessage');
//     });
//
//     describe("isClassValid", () => {
//         it("Should return if the CWL class is valid", () => {
//
//             const res1 = jsonSchemaService.isClassValid("Workflow");
//             expect(res1).toBe(true);
//
//             const res2 = jsonSchemaService.isClassValid("CommandLineTool");
//             expect(res2).toBe(true);
//
//             const res3 = jsonSchemaService.isClassValid("ExpressionTool");
//             expect(res3).toBe(true);
//
//             const res4 = jsonSchemaService.isClassValid("InvalidClass");
//             expect(res4).toBe(false);
//
//         });
//     });
//
//     describe("isValidCWLClass", () => {
//         it("Should return false if we pass an undefined value", () => {
//             const re1 = jsonSchemaService.isValidCWLClass(undefined);
//             expect(re1).toBe(false);
//         });
//
//         it("Should return false if we pass an object without 'cwlVersion' or 'class'", () => {
//             const res1 = jsonSchemaService.isValidCWLClass({
//                 prop1: 123,
//                 prop2: 123
//             });
//
//             expect(res1).toBe(false);
//         });
//     });
//
//     describe("validateJson", () => {
//         it("Should call postMessage with an error if the JSON can't be parsed", () => {
//
//             const jsonText = "Not a valid JSON";
//
//             jsonSchemaService.validateJson(jsonText);
//
//             expect(window.postMessage).toHaveBeenCalledWith({
//                 isValidatableCwl: false,
//                 isValidCwl: false,
//                 errors: [ "Not a valid JSON"],
//                 schema: undefined
//             });
//         });
//
//         it("Should call postMessage with the validator result if the JSON has a valid Class and Version", () => {
//
//             const jsonText = '{"class":"Workflow", "cwlVersion":"draft-3"}';
//             jsonSchemaService.validateJson(jsonText);
//
//             expect(window.postMessage).toHaveBeenCalledWith({
//                 isValidatableCwl: true,
//                 isValidCwl: false,
//                 errors: ["mockValidationErrorMessage"],
//                 class: "Workflow",
//                 schema: JSON.parse(jsonText)
//             });
//         });
//
//     });
//
// });
