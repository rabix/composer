import {RabixComposerPage} from "./app.po";

describe("rabix-composer App", () => {
    let app: RabixComposerPage;

    beforeEach(() => {
        app = new RabixComposerPage();
    });

    it("should display the layout", () => {
        app.isLayoutDisplayed().then(isDisplayed => {
            expect(isDisplayed).toBeTruthy("Layout component is not displayed properly");
        });
    });
});
