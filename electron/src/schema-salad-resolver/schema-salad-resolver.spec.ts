import chai = require("chai");
import {RecursiveNestingError} from "./errors/recursive-nesting.error";

const assert   = chai.assert;
const resolver = require("./schema-salad-resolver");


describe("Schema salad resolver", () => {

    it("should have a “resolveContent” method", () => {
        assert.isFunction(resolver["resolveContent"]);
    });

    it("should embed values from $graph into run props that start with a hash", (done) => {

        const original = {
            "$graph": [
                {"id": "index", test: "1"},
                {"id": "search", test: "2"},
                {
                    "id": "main",
                    "steps": {
                        "index": {"run": "#index"},
                        "search": {"run": "#search"}
                    }
                }]
        };

        const originalSerialized = JSON.stringify(original, null, 4);

        const expected           = JSON.parse(originalSerialized);
        expected.$graph[2].steps = {
            "index": {"run": {"id": "index", test: "1"}},
            "search": {"run": {"id": "search", test: "2"}}
        };
        const expectedSerialized = JSON.stringify(expected, null, 4);

        resolver.resolveContent(originalSerialized, "").then(resolved => {
            const resolvedSerialized = JSON.stringify(resolved, null, 4);
            assert.equal(resolvedSerialized, expectedSerialized);
            done();
        }).catch(done);
    });

    it("should adapt ins and outs keys to remove $graph roots", (done) => {
        const original           = {
            "$graph": [{
                "id": "main",
                "steps": {
                    "index": {"in": {"file": "#main/infile"}},
                    "search": {"in": {"file": "#main/index/result", "term": "#main/term"}}
                }
            }]
        };
        const originalSerialized = JSON.stringify(original, null, 4);

        const expected           = JSON.parse(originalSerialized);
        expected.$graph[0].steps = {
            "index": {"in": {"file": "infile"}},
            "search": {"in": {"file": "index/result", "term": "term"}}
        };
        const expectedSerialized = JSON.stringify(expected, null, 4);

        resolver.resolveContent(originalSerialized, "").then(resolved => {
            const resolvedSerialized = JSON.stringify(resolved, null, 4);

            assert.equal(resolvedSerialized, expectedSerialized);
            done();
        }).catch(done);
    });

    it("should resolve regular workflow without $graph", (done) => {
        const original = {
            "class": "Workflow",
            "inputs": [],
            "outputs": [],
            "steps": [
                {
                    "id": "step",
                    "run": "test/tool-stub.json"
                }
            ]
        };

        const originalSerialized = JSON.stringify(original, null, 4);

        const expected = JSON.parse(originalSerialized);

        expected.steps[0].run = {
            "class": "CommandLineTool",
            "inputs": [],
            "outputs": [],
        };

        expected.steps[0]["sbg:rdfId"]     = "test/tool-stub.json";
        expected.steps[0]["sbg:rdfSource"] = __dirname.replace("schema-salad-resolver", "") + "test/tool-stub.json";

        const expectedSerialized = JSON.stringify(expected, null, 4);

        resolver.resolveContent(originalSerialized, __dirname).then(resolved => {
            const resolvedSerialized = JSON.stringify(resolved, null, 4);

            assert.equal(resolvedSerialized, expectedSerialized);
            done();
        }).catch(done);
    });

    it("should detect recursive nesting as invalid cwl", function(done) {
        const original = {
            "class": "Workflow",
            "inputs": [],
            "outputs": [],
            "steps": [
                {
                    "id": "step",
                    "run": "test/recursive-workflow-stub.json"
                }
            ]
        };

        const originalSerialized = JSON.stringify(original, null, 4);

        resolver.resolveContent(originalSerialized, __dirname).then(() => {
            done(new Error("Should detect recursive nesting as invalid cwl"));
        }, (err) => {
            assert.instanceOf(err, RecursiveNestingError, "Should be instance of RecursiveNestingError, but instead got " + err.__proto__.constructor.toString());
            done();
        });


    });

});
