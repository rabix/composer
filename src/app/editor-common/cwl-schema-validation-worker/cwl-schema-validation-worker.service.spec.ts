import {inject, TestBed} from "@angular/core/testing";
import {CwlSchemaValidationWorkerService} from "./cwl-schema-validation-worker.service";
import {WebWorkerBuilderService} from "../../core/web-worker/web-worker-builder.service";

describe("CwlSchemaValidationWorkerService", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CwlSchemaValidationWorkerService, WebWorkerBuilderService]
        });
    });

    it("should ...", inject([CwlSchemaValidationWorkerService], (service: CwlSchemaValidationWorkerService) => {
    }));
});
