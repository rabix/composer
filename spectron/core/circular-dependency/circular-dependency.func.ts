import * as spectron from "spectron";
import {mockSBGClient} from "../../util/sbg-client-proxy";
import {boot, shutdown} from "../../util/util";

const assert = require("assert");

describe("circular dependency", () => {
    let app: spectron.Application;

    afterEach(() => shutdown(app));

    it("should not throw error when getStartedNotification opens addSourceModal", async function () {

        app = await boot(this, {
            overrideModules: [
                {
                    module: "./sbg-api-client/sbg-client",
                    override: {
                        SBGClient: mockSBGClient({
                            getUser: () => {
                                return new Promise((res) => {
                                    res({
                                        "address": "",
                                        "affiliation": "",
                                        "city": "",
                                        "country": "",
                                        "email": "",
                                        "first_name": "",
                                        "href": "",
                                        "last_name": "",
                                        "phone": "",
                                        "state": "",
                                        "tags": [],
                                        "username": "someusername",
                                        "zip_code": ""
                                    });
                                });

                            }
                        })
                    }
                }
            ]
        });

        const client = app.client;

        const myAppsPanel = `ct-my-apps-panel`;
        const platformCredentialsModal = `ct-platform-credentials-modal`;
        const addSourcesModal = `ct-add-source-modal`;
        const getStartedNotification = `ct-get-started-notification`;

        await client.click(`${myAppsPanel} [data-test=add-sources-button]`);

        await client.element(addSourcesModal);

        await client.click(`${addSourcesModal} [data-test=platform-tab]`);
        await client.click(`${addSourcesModal} [data-test=add-source-modal-connection-button]`);

        await client.element(platformCredentialsModal);
        await client.setValue(`${platformCredentialsModal} [formControlName=token]`, "1111111111111111111111111daa345f");
        await client.waitForEnabled(`${platformCredentialsModal} button[type=submit]`, 3000);

        await client.click(`${platformCredentialsModal} button[type=submit]`);

        await client.click(`${addSourcesModal} [data-test=add-source-modal-cancel-button]`);

        await client.click(`${getStartedNotification} button`);

        const logs = await client.getRenderProcessLogs();

        const errors = logs.filter(log => log.level === "SEVERE");

        assert.equal(errors.length, 0);

    });
});

