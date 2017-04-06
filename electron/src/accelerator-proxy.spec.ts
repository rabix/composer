import chai = require("chai");
const assert = chai.assert;

import sinon = require("sinon");


describe("Accelerator Proxy", () => {
    let proxy;

    beforeEach("delete acproxy module from require cache and prepare a new one", () => {
        delete require.cache[require.resolve("./accelerator-proxy")];
        proxy = require("./accelerator-proxy");
    });

    it("should have on and pass methods available", () => {
        assert.isFunction(proxy.on);
        assert.isFunction(proxy.pass);
    });
});
