import {browser} from "protractor";

export function httpMock() {

    // console.log("Require cache is", require.cache);

    return browser.executeScript(function (callback) {
        const mock = window["require"]("electron").remote.getGlobal("__webdriver").mockRequire;

        function mocked() {

        }

        Object.assign(mocked, {
            get: () => {

            },
            post: () => {

            },
            defaults: () => {

            }
        });


        mock("request", mocked);
    });

}
