import {browser} from "protractor";
import {RabixComposerPage} from "./app.po";

describe("rabix-composer App", () => {
    let app: RabixComposerPage;

    beforeEach(() => {
        browser.restartSync();
        app = new RabixComposerPage();
    });

    afterEach(() => {
        browser.close();
    });

    it("should display the layout", () => {
        app.isLayoutDisplayed().then(isDisplayed => {
            expect(isDisplayed).toBeTruthy("Layout component is not displayed properly");
        });
    });
});
