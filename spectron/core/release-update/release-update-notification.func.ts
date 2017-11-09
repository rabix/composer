import * as spectron from "spectron";
import {boot, shutdown} from "../../util/util";

const assert = require("assert");

describe("new release check", function () {


    let app: spectron.Application;

    it("shows that there are no updates if latest version is older than the current one", async function () {

        app = await boot(this, {
            overrideModules: [{
                module: "./github-api-client/github-client",
                override: {
                    getReleases: () => {
                        return Promise.resolve([
                            {"tag_name": "v0.0.2", "html_url": "", "body": ""},
                            {"tag_name": "v0.0.3", "html_url": "", "body": ""},
                            {"tag_name": "v0.0.4", "html_url": "", "body": ""}
                        ]);
                    }
                }
            }]

        });

        try {
            await clickOnSettingsAndWaitForUpdatesAvailableButton();
            assert.fail("Update Available button should not be visible");
        } catch (e) {}
    });

    it("shows that there is an update amongst multiple releases", async function () {

        app = await boot(this, {
            skipUpdateCheck: false,
            overrideModules: [
                {
                    module: "./github-api-client/github-client",
                    override: {
                        getReleases: () => {
                            return Promise.resolve([
                                {"tag_name": "v0.0.1", "html_url": "", "body": ""},
                                {"tag_name": "v100.0.1", "html_url": "", "body": ""},
                                {"tag_name": "v0.0.2", "html_url": "", "body": ""},
                            ]);
                        }
                    }
                }
            ]
        });

        await app.client.waitForVisible("ct-update-platform-modal", 5000);
        const outOfDateText = await displaysThatAppIsOutOfDateText();

        assert.equal(outOfDateText, true);
    });

    it("shows that the update is available when it is", async function () {
        app = await boot(this, {
            skipUpdateCheck: false,
            overrideModules: [
                {
                    module: "./github-api-client/github-client",
                    override: {
                        getReleases: () => {
                            return Promise.resolve([
                                {
                                    "html_url": "https://github.com/rabix/composer/releases/tag/v1.0.0-beta.3",
                                    "tag_name": "v100.0.0",
                                    "body": ""
                                }
                            ]);
                        }
                    }
                }
            ]
        });

        const client = app.client;

        // Waiting for modal on initialization to be visible
        await client.waitForVisible("ct-update-platform-modal", 5000);
        let outOfDateText = await displaysThatAppIsOutOfDateText();
        assert.equal(outOfDateText, true);

        // Close modal
        await clickOnDiscardVersionButton();

        await clickOnSettingsAndWaitForUpdatesAvailableButton();
        await client.click("[data-test=updates-available]");

        // Waiting for modal after clicking on "Updates Available"
        await client.waitForVisible("ct-update-platform-modal", 5000);
        outOfDateText = await displaysThatAppIsOutOfDateText();

        assert.equal(outOfDateText, true);
    });

    afterEach(() => shutdown(app));

    function whenModalIsReady() {
        return app.client.waitForVisible("ct-update-platform-modal", 1000);
    }

    function displaysThatAppIsUpToDateText() {
        return whenModalIsReady()
            .then(() => app.client.getText("ct-update-platform-modal .header-text"))
            .then(txt => txt === "Rabix Composer is up to date!");

    }

    function displaysThatAppIsOutOfDateText() {
        return whenModalIsReady()
            .then(() => app.client.getText("ct-update-platform-modal .header-text"))
            .then(text => text === "A new version of Rabix Composer is available!");
    }

    function clickOnSettingsAndWaitForUpdatesAvailableButton() {
        const updateBtnSelector = "[data-test=updates-available]";
        return app.client.click("ct-settings-menu")
            .then(() => app.client.waitForVisible(updateBtnSelector, 5000));
    }

    function clickOnDiscardVersionButton() {
        const discardVersionButton = "[data-test=update-platform-modal-dismiss-button]";
        return app.client.click(discardVersionButton);
    }
});
