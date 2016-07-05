/*
'use strict';

import {it, inject, async, describe, beforeEachProviders} from "@angular/core/testing";
import {WebWorkerService, ValidationResponse} from "./web-worker.service";

describe("WebWorkerService", () => {

    beforeEachProviders(() => [WebWorkerService]);

    describe("validateJsonSchema", () => {
        it("should return an observable emitting the validation result",
            async(inject([WebWorkerService], (webWorkerService: WebWorkerService, done) => {

                let mockJson: string = '{ "value": "mock content" }';

                webWorkerService.validateJsonSchema(mockJson).subscribe((res: ValidationResponse) => {
                    console.log('hereee2');
                    console.log('result ' + res.isValid);
                    expect(res.isValid).toBe(123);

                    done();
                }, err => console.log(err));
            }))
        );
    });
});
*/
