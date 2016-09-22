import {inject} from "@angular/core/testing";
import {GuidService} from "./guid.service";
import {TestBed} from "@angular/core/testing/test_bed";

describe("GUID Generator Service", () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: GuidService, useClass: GuidService }
            ]
        });
    });

    it("Should have a generator function to generate IDs",
        inject([GuidService], (guid: GuidService) => {
            expect(typeof guid.generate).toBe("function");
        }));

    it("Should be able to generate a proper v4 guid",
        inject([GuidService], (guid: GuidService) => {
            const id = guid.generate();

            expect(typeof id).toBe("string");
            expect(id.length).toBe(36);

            const parts = id.split("-");
            expect(parts.length).toBe(5);
            expect(parts[0].length).toBe(8);
            expect(parts[1].length).toBe(4);
            expect(parts[2].length).toBe(4);
            expect(parts[3].length).toBe(4);
            expect(parts[4].length).toBe(12);
        }));

    it("Should not repeat generated ids",
        inject([GuidService], (guid: GuidService) => {
            const limit = 10;
            const ids   = [];

            for (let i = 0; i < limit; i++) {
                ids.push(guid.generate());
            }

            const unique = ids.filter((id, index, arr) => arr.indexOf(id) === index);
            expect(unique.length).toBe(limit);
        }));

});
