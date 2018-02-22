import chai = require("chai");

const assert = chai.assert;

describe("Accelerator Proxy", () => {
    let proxy;

    beforeEach(() => {
        delete require.cache[require.resolve("./accelerator-proxy")];
        proxy = require("./accelerator-proxy");
    });

    it("should have on and pass methods available", () => {
        assert.isFunction(proxy.on);
        assert.isFunction(proxy.pass);
    });
});
