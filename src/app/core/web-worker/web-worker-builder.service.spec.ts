import {inject, TestBed} from "@angular/core/testing";
import {WebWorkerBuilderService} from "./web-worker-builder.service";

describe("WebWorkerBuilderService", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [WebWorkerBuilderService]
        });
    });

    it("should ...", inject([WebWorkerBuilderService], (service: WebWorkerBuilderService) => {
        expect(service).toBeTruthy();
    }));
});
