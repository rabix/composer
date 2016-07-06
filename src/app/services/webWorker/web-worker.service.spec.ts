'use strict';

import {it, describe, beforeEachProviders} from "@angular/core/testing";
import {WebWorkerService, ValidationResponse} from "./web-worker.service";

//DON'T use Angular's async method here, it will not always wait for the test to execute!
describe("WebWorkerService", () => {

    beforeEachProviders(() => []);

    describe("validateJsonSchema", () => {
        it("should return an observable emitting the validation result", (done) => {
            let webWorkerService = new WebWorkerService();
            let mockJson:string = '{"cwlVersion": "draft-3", "class": "CommandLineTool"}';

            webWorkerService.validateJsonSchema(mockJson).subscribe((res:ValidationResponse) => {

                expect(res.isValid).toBe(false);
                expect(res.errors.length).toBe(3);
                done();

            }, err => console.log(err));
        });

        it("should return an Error message if the string is not a JSON", (done) => {
            let webWorkerService = new WebWorkerService();
            let text:string = "I am not a JSON";

            webWorkerService.validateJsonSchema(text).subscribe((res:ValidationResponse) => {

            }, err => {
                expect(err).toEqual(new Error('I am not a JSON is not a valid JSON'));
                done();
            });
        });

        
        it("should return an Error message if JSON has no cwlVersion or class", (done) => {
            let webWorkerService = new WebWorkerService();
            let text:string = '{ "fake": "json" }';

            webWorkerService.validateJsonSchema(text).subscribe((res:ValidationResponse) => {

            }, err => {
                expect(err).toEqual(new Error('JSON is missing "cwlVersion" or "class"'));
                done();
            });
        });
        
        
    });
});
