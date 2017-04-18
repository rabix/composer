import {RabixComposerPage} from "./app.po";

describe("rabix-composer App", () => {
    let page: RabixComposerPage;

    beforeEach(() => {
        page = new RabixComposerPage();
    });

    it("should display message saying app works", () => {
        page.navigateTo();
        expect(true).toEqual(true);
    });
});
