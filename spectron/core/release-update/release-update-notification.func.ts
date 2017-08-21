import * as spectron from "spectron";
import {boot, shutdown} from "../../util/util";

const assert = require("assert");

describe("new release check", function () {


    let app: spectron.Application;

    it.skip("shows that it cannot fetch update data without the internet connection", async function () {

        app = await boot(this);

        const client = app.client;
        client.setNetworkConnection(0);
        await triggerUpdateCheck();

        const modalText = await client.getText("ct-update-platform-modal .dialog-content");
        assert.equal(modalText, "Failed to check for updates.");
    });

    it("shows that there are no updates if latest version is older than the current one", async function () {

        app = await boot(this, {
            overrideModules: {
                "./github-api-client/github-client": {
                    getReleases: () => {
                        return Promise.resolve([
                            {"tag_name": "v0.0.2", "html_url": "", "body": ""},
                            {"tag_name": "v0.0.3", "html_url": "", "body": ""},
                            {"tag_name": "v0.0.4", "html_url": "", "body": ""}
                        ]);
                    }
                }
            }
        });

        await triggerUpdateCheck();

        const noUpdates = await displaysNewUpdateSection();
        const upToDateText = await displaysThatAppIsUpToDateText();

        assert.equal(noUpdates, false);
        assert.equal(upToDateText, true);
    });

    it("shows that there is an update amongst multiple releases", async function () {

        app = await boot(this, {
            overrideModules: {
                "./github-api-client/github-client": {
                    getReleases: () => {
                        return Promise.resolve([
                            {"tag_name": "v0.0.1", "html_url": "", "body": ""},
                            {"tag_name": "v100.0.1", "html_url": "", "body": ""},
                            {"tag_name": "v0.0.2", "html_url": "", "body": ""},
                        ]);
                    }
                }
            }
        });

        await app.client.waitForVisible("ct-update-platform-modal", 5000);

        const updateShown = await displaysNewUpdateSection();
        const outOfDateText = await displaysThatAppIsOutOfDateText();

        assert.equal(updateShown, true);
        assert.equal(outOfDateText, true);
    });

    it("shows that the update is available when it is", async function () {
        app = await boot(this, {
            overrideModules: {
                "./github-api-client/github-client": {
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
        });

        const client = app.client;
        await client.waitForVisible("ct-update-platform-modal", 5000);

        const displaysUpdate = await displaysNewUpdateSection();
        const outOfDateText = await displaysThatAppIsOutOfDateText();

        assert.equal(displaysUpdate, true);
        assert.equal(outOfDateText, true);
    });

    afterEach(async () => {
        await shutdown(app);
    });


    function displaysNewUpdateSection() {
        return app.client.isVisible(".dialog-content");
    }

    function displaysThatAppIsUpToDateText() {
        return app.client.getText("ct-update-platform-modal .header-text")
            .then(text => {
            return text === "Rabix Composer is up to date!";
        });
    }

    function displaysThatAppIsOutOfDateText() {
        return app.client.getText("ct-update-platform-modal .header-text").then(text => {
            return text === "A new version of Rabix Composer is available!";
        });
    }

    function triggerUpdateCheck() {
        return app.client.click("ct-settings-menu")
            .then(() => app.client.click("[data-test=check-for-updates]"))
            .then(() => app.client.waitForVisible("ct-update-platform-modal", 5000));
    }
});

