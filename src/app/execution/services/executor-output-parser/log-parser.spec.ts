import {parseLine} from "./log-parser";
import {ExecutionState} from "../../models";
import objectContaining = jasmine.objectContaining;

describe("log parser", () => {

    it("parses a step starting statement log entry", () => {

        const line = "Job root.index_cwl has started";

        expect(parseLine(line)).toEqual(objectContaining({
            status: "started" as ExecutionState,
            stepID: "index_cwl"
        }));

    });

    it("parses a step completion log entry", () => {

        const line = "Job root.index_cwl has completed";
        expect(parseLine(line)).toEqual(objectContaining({
            status: "completed" as ExecutionState,
            stepID: "index_cwl"
        }));

    });

    it("parses a step failure log entry", () => {
        const line = "Job root.index_cwl, " +
            "rootId: bdc01ce3-4b4d-4fa5-bd4d-84450ae85fe5 failed: " +
            "Job root.index_cwl failed with exit code 1";

        expect(parseLine(line)).toEqual(objectContaining({
            stepID: "index_cwl",
            status: "failed" as ExecutionState,
        }));


    });

    it("does not parse sub-step entries", () => {
        [
            "Job root.superstep.substep has completed",
            "Job root.superstep.substep has started",
            "Job root.superstep.substep failed",
        ].forEach(line => {
            expect(parseLine(line)).toBeUndefined();
        });

    });

});
