import {inject, TestBed} from "@angular/core/testing";
import {CwlSchemaValidationWorkerService} from "./cwl-schema-validation-worker.service";

describe("CwlSchemaValidationWorkerService", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CwlSchemaValidationWorkerService]
        });
    });

    it("should ...", inject([CwlSchemaValidationWorkerService], (service: CwlSchemaValidationWorkerService) => {
        expect(service).toBeTruthy();
    }));
});
