import {browser} from "protractor";

export function cleanQuit() {
    browser.quit();
}

export function boot() {
    browser.restartSync();
}
