import {assert} from "chai";
import * as proxy from "proxyquire";
import * as sinon from "sinon";

describe("File Controller", () => {

    it("should export a get method", () => {
        assert.isFunction(require("./file.controller").get);
    });

    it("should proxy a file read to fs controller if the path is an absolute", () => {

        const spy         = sinon.spy();
        const patchedCtrl = proxy("./file.controller", {
            "./fs.controller": {
                readFileContent: spy
            }
        });

        patchedCtrl.get("/hello", (err, info) => {
            assert.isTrue(spy.calledOnce, "Spy didn't get called");
            assert.equal(spy.args[0][0], "/hello", "Spy called with an incorrect path");
            assert.isFunction(spy.args[0][1], "Spy didn't get a callback function");
        });
    });
});
