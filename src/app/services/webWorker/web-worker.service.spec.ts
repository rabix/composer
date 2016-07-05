'use strict';

import {it, inject, async, describe, beforeEachProviders} from "@angular/core/testing";
import {WebWorkerService, ValidationResponse} from "./web-worker.service";

describe("WebWorkerService", () => {

    beforeEachProviders(() => [WebWorkerService]);

    describe("validateJsonSchema", () => {
        it("should return an observable emitting the validation result",
            async(inject([WebWorkerService], (webWorkerService: WebWorkerService) => {

                    let mockJson: string = '{"cwlVersion": "draft-3", "class": "CommandLineTool"}';

                    webWorkerService.validateJsonSchema(mockJson).subscribe((res: ValidationResponse) => {

                        expect(res.isValid).toBe(false);
                        expect(res.errors.length).toBe(3);

                    }, err => console.log(err));
                })
            ));

        //TODO(mate): figure out why it only works with one test

        /*it("should return an Error message if the string is not a JSON",
            async(inject([WebWorkerService], (webWorkerService: WebWorkerService) => {
                    let text: string = "I am not a JSON";
                    // expect(err).toEqual(new Error('I am not a JSON is not a valid JSON123'));

                    webWorkerService.validateJsonSchema(text).subscribe((res: ValidationResponse) => {
                        console.log('heree 1111');
                    }, err => {
                        expect(_.isEqual(err, 123)).toBe(true);
                    });
                })
            ));*/
    });
});
