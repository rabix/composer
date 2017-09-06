import chai = require("chai");
import proxy = require("proxyquire");
import sinon = require("sinon");

const assert = chai.assert;


describe("IPC Router", function () {


    it.skip("should register the data-request event cb", function (done) {

        const electron = {ipcMain: {on: sinon.spy()}};
        const router   = proxy("./ipc-router", {electron});
        router.start();

        setTimeout(() => {
            assert.isTrue(electron.ipcMain.on.calledOnce);

            const callArgs = electron.ipcMain.on.args[0];
            assert.equal(callArgs[0], "data-request");

            assert.isFunction(callArgs[1]);
            done();
        });
    });

    it("should call the appropriate controller function when required and return the response", function (done) {
        const send = sinon.spy();

        const testRouteEndpoint = sinon.spy((data, callback) => {
            callback(null, {name: "Zoro"});
        });

        const event    = {sender: {send}};
        const routes   = {testRouteEndpoint};
        const electron = {
            ipcMain: {
                on: (route, callback) => {
                    callback(event, {
                        id: "cool-123",
                        data: "eventData",
                        message: "testRouteEndpoint"
                    });
                }
            }
        };

        const router = proxy("./ipc-router", {electron, "./routes": routes});
        router.start();

        const [data, callback] = testRouteEndpoint.args[0];
        assert.isTrue(testRouteEndpoint.calledOnce);
        assert.equal(data, "eventData");
        assert.equal(callback.length, 2);

        const [replyMessage, replyData] = send.args[0];
        assert.isTrue(send.calledOnce);
        assert.equal(replyMessage, "data-reply");
        assert.property(replyData, "id");
        assert.property(replyData, "data");
        assert.equal(replyData.data.name, "Zoro");
        done();
    });
});
