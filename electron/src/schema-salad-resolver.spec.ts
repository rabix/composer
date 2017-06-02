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

        const expected = JSON.parse(JSON.stringify(original));

        expected.$graph[2].steps = {
            "index": {"run": {"id": "index", test: "1"}},
            "search": {"run": {"id": "search", test: "2"}}
        };

        resolver.resolveContent(JSON.stringify(original), "").then(resolved => {
            assert.equal(JSON.stringify(resolved), JSON.stringify(expected));
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

        const expected = JSON.parse(JSON.stringify(original));

        expected.$graph[0].steps = {
            "index": {"in": {"file": "infile"}},
            "search": {"in": {"file": "index/result", "term": "term"}}
        };

        resolver.resolveContent(JSON.stringify(original), "").then(resolved => {
            assert.equal(JSON.stringify(resolved), JSON.stringify(expected));
            done();
        });
    });
});
