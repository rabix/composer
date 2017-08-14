import {browser, by, element} from "protractor";
import {ProfileLoader} from "../../helpers/profile-loader";

describe("Settings Dropdown", async () => {

    beforeEach(() => {
        browser.restartSync();
    });

    afterEach(() => {
        browser.quit();
    });

    it("should display an active user", async () => {

        const user = {
            "id": "api_demo",
            "token": "3d15bcde2052476280f2bc6d0c56f69b",
            "url": "https://cgc-api.sbgenomics.com",
            "user": {
                "username": "demon",
            }
        };

        await ProfileLoader.patchLocal({
            activeCredentials: user,
            credentials: [user]
        });

        browser.sleep(2000);

        const settingsMenu = element(by.css("ct-settings-menu"));
        const text         = await settingsMenu.getText();

        expect(text.trim()).toEqual("demon (CGC)");

    });
});

