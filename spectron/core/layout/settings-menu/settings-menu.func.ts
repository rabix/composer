import * as spectron from "spectron";
import {boot, shutdown} from "../../../util/util";

const assert = require("assert");


describe("settings menu", function () {

    let app: spectron.Application;

    it("displays name of the active user", async function () {

        const user = {
            "id": "cgc-api_demo",
            "token": null,
            "url": "https://cgc-api.sbgenomics.com",
            "user": {
                "username": "demon",
            }
        };

        app = await boot(this, {
            localRepository: {
                activeCredentials: user,
                credentials: [user]
            }
        });

        const client = app.client;

        const text = await client.getText("ct-settings-menu");
        assert.equal(text.trim(), "demon (CGC)");
    });

    afterEach(() => shutdown(app));

});
