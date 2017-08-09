import {browser, by, element} from "protractor";

export class RabixComposerPage {
    navigateTo() {
        return browser.get("/");
    }

    getReadyText() {
        return element(by.css("[data-marker-ready]")).getAttribute("data-marker-ready");
    }

    isLayoutDisplayed() {
        return element(by.css("[data-test=layout]")).isDisplayed();
    }
}
