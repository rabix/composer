'use strict';

import {it, describe} from "@angular/core/testing";
import {WebWorkerService} from "./web-worker.service";
import {ValidationResponse} from "./json-schema/json-schema.service";

//DON'T use Angular's async method here, it will not always wait for the test to execute!
describe("WebWorkerService", () => {

    describe("validateJsonSchema", () => {
        it("should return an observable emitting the validation result", (done) => {
            const webWorkerService = new WebWorkerService();
            const mockJson:string = '{"cwlVersion": "draft-3", "class": "CommandLineTool"}';

            webWorkerService.validateJsonSchema(mockJson);

            webWorkerService.validationResultStream.subscribe((res:ValidationResponse) => {
                expect(res.isValidCwl).toBe(false);
                expect(res.isValidatableCwl).toBe(true);
                expect(res.schema).toEqual(JSON.parse(mockJson));
                expect(res.errors.length).toBe(3);
                done();
            }, err => console.log(err));
        });

        it("should return an Error message if the string is not a JSON", (done) => {
            const webWorkerService = new WebWorkerService();
            const text:string = "I am not a JSON";

            webWorkerService.validateJsonSchema(text);

            webWorkerService.validationResultStream.subscribe((res:ValidationResponse) => {
                expect(res.errors[0]).toEqual('Not a valid JSON');
                done();
            });
        });

        it("should return an Error message if JSON has no cwlVersion or class", (done) => {
            let webWorkerService = new WebWorkerService();
            let text:string = '{ "fake": "json" }';

            webWorkerService.validateJsonSchema(text);

            webWorkerService.validationResultStream.subscribe((res:ValidationResponse) => {
                expect(res.errors[0]).toEqual("JSON is missing 'cwlVersion' or 'class'");
                done();
            });
        });

    });
});
