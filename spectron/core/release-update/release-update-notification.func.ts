import * as spectron from "spectron";
import {boot, shutdown} from "../../util/util";

const assert = require("assert");

describe("new release check", function () {


    let app: spectron.Application;

    it.skip("shows that it cannot fetch update data without the internet connection", async function () {

        app = await boot(this);

        const client = app.client;
        client.setNetworkConnection(0);
        await triggerUpdateCheck(client);

        const modalText = await client.getText("ct-update-platform-modal .dialog-content");
        assert.equal(modalText, "Failed to check for updates.");
    });

    it("shows that the update is available if it is", async function () {
        app = await boot(this, {

        });

        const client = app.client;
        await triggerUpdateCheck(client);

        const modalText = await client.getText("ct-update-platform-modal .dialog-content");
        assert.equal(modalText, "Rabix Composer is up to date!");
    });

    afterEach(async () => {
        await shutdown(app);
    });

});

function triggerUpdateCheck(client) {
    return client.click("ct-settings-menu")
        .then(() => client.click("[data-test=check-for-updates]"))
        .then(() => client.waitForVisible("ct-update-platform-modal", 5000));
}
