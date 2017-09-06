import chai = require("chai");
import proxy = require("proxyquire");
import sinon = require("sinon");

const assert = chai.assert;


describe("IPC Router", function () {

    it("should register the data-request event callback", function (done) {
        this.timeout(2000);

        const electron = {ipcMain: {on: sinon.spy()}};
        console.log("Mocked electron");

        const router = proxy("./ipc-router", {electron});
        console.log("Proxied router");

        router.start();
        console.log("Started router");

        assert.isTrue(electron.ipcMain.on.calledOnce);
        console.log("Asserting that called once is true, call count:", electron.ipcMain.on.callCount);

        const callArgs = electron.ipcMain.on.args[0];
        console.log("Call args", electron.ipcMain.on.args);

        console.log("Checking if", callArgs[0], " is data-request");
        assert.equal(callArgs[0], "data-request");

        console.log("Checking if is function ", typeof callArgs[1]);
        assert.isFunction(callArgs[1]);

        console.log("Calling done");
        done();

        console.log("Ended test");
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
