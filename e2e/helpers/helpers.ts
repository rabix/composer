import {browser} from "protractor";

export type NodeCallback = (err?: Error, result?: any, ...args: any[]) => void;

/**
 * Used to close the app after suite run
 */
export function cleanQuit() {
    browser.quit();
}

/**
 * Used to prepare the application for testing
 */
export function boot() {
    const browserInstance = browser.restartSync();
    browserInstance
}

/**
 * Calls a remote route handler registered in {@link routes}.
 *
 * @param {string} method name of the route handler function to call
 * @param data data object used as an argument for the route handler
 * @param {NodeCallback} callback
 */
export function callRemoteEndpoint(method: string, data: any, callback: NodeCallback) {
    return browser.executeAsyncScript(function (method, data, callback) {
            window["require"]("electron").remote
                .getGlobal("__webdriver")
                .endpoints[method](JSON.parse(data), (err, result) => callback(err, result));
        }, method, JSON.stringify(data)
    ).then(data => callback(null, data), callback);
}
