import * as spectron from "spectron";
import {boot, shutdown} from "../../util/util";

const assert = require("assert");

describe("new release check", function () {


    let app: spectron.Application;

    it("shows that it cannot fetch update data if github api fails", async function () {

        app = await boot(this, {
            overrideModules: [{
                module: "./github-api-client/github-client",
                override: {
                    getReleases: () => {
                        return Promise.reject("Error");
                    }
                }
            }]
        });

        const client = app.client;
        await client.pause(500);
        await triggerUpdateCheck();

        await client.waitForVisible("ct-modal-error", 1000);
        const modalText = await client.getText("ct-modal-error .body");
        assert.equal(modalText, "An error occurred while checking for update information.");
    });

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

        await triggerUpdateCheck();

        const upToDateText = await displaysThatAppIsUpToDateText();

        assert.equal(upToDateText, true);
    });

    it("shows that there is an update amongst multiple releases", async function () {

        app = await boot(this, {
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
        await client.waitForVisible("ct-update-platform-modal", 5000);

        const outOfDateText = await displaysThatAppIsOutOfDateText();

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

    function triggerUpdateCheck() {
        const updateBtnSelector = "[data-test=check-for-updates]";
        return app.client.click("ct-settings-menu")
            .then(() => app.client.waitForVisible(updateBtnSelector, 5000))
            .then(() => app.client.click(updateBtnSelector));
    }
});

