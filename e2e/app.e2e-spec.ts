import {browser, protractor} from "protractor";
import {RabixComposerPage} from "./app.po";
import {boot, cleanQuit} from "./helpers/helpers";

describe("rabix-composer App", () => {
    let app: RabixComposerPage;

    beforeEach(() => {
        boot();

        app = new RabixComposerPage();
    });

    afterEach(() => {
        cleanQuit();
    });

    it("should display the layout", () => {
        app.isLayoutDisplayed().then(isDisplayed => {
            expect(isDisplayed).toBeTruthy("Layout component is not displayed properly");
        });
    });
});
