import {by, element} from "protractor";
import {boot, cleanQuit} from "../../helpers/helpers";
import {ProfileLoader} from "../../helpers/profile-loader";

describe("Settings Dropdown", async () => {

    beforeEach(() => {
        boot();
    });

    afterEach(() => {
        cleanQuit();
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

        const settingsMenu = element(by.css("ct-settings-menu"));
        const text         = await settingsMenu.getText();

        expect(text.trim()).toEqual("demon (CGC)");

    });
});

