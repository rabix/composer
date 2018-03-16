import chai = require("chai");

import proxy = require("proxyquire");
import sinon = require("sinon");

const assert = chai.assert;


xdescribe("IPC Router", function () {


    xit("should register the data-request event cb", function (done) {

        const electron = {ipcMain: {on: sinon.spy()}};
        const router   = proxy("./ipc-router", {electron});
        router.start();

        const onSpy = electron.ipcMain.on;
        assert.equal(onSpy.callCount, 2, `IPC “on” handler was called ${onSpy.callCount} times instead of 1 time.`);

        const [firstArgs, secondArgs] = onSpy.getCalls().map(call => call.args);

        assert.equal(firstArgs[0], "data-request");
        assert.equal(secondArgs[0], "data-request-terminate");

        assert.isFunction(firstArgs[1]);
        assert.isFunction(secondArgs[1]);

        done();
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
