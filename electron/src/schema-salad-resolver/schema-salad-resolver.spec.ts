import chai = require("chai");

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
        });
    });

    it("should adapt ins and outs keys to remove $graph roots", (done) => {
        const original = {
            "$graph": [{
                "id": "main",
                "steps": {
                    "index": {"in": {"file": "#main/infile"}},
                    "search": {"in": {"file": "#main/index/result", "term": "#main/term"}}
                }
            }]
        };
        const originalSerialized = JSON.stringify(original, null, 4);

        const expected = JSON.parse(originalSerialized);
        expected.$graph[0].steps = {
            "index": {"in": {"file": "infile"}},
            "search": {"in": {"file": "index/result", "term": "term"}}
        };
        const expectedSerialized = JSON.stringify(expected, null, 4);

        resolver.resolveContent(originalSerialized, "").then(resolved => {
            const resolvedSerialized = JSON.stringify(resolved, null, 4);

            assert.equal(resolvedSerialized, expectedSerialized);
            done();
        });
    });
});
