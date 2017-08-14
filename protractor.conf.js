// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

/*global jasmine */
const rimraf = require("rimraf");

const {SpecReporter} = require('jasmine-spec-reporter');
const glob = require("glob");

exports.config = {
    allScriptsTimeout: 11000,
    directConnect: true,
    specs: [
        "./e2e/**/*.e2e-spec.ts"
    ],
    capabilities: {
        browserName: "chrome",
        chromeOptions: {
            binary: (() => {
                // MacOS: build/rabix-composer-darwin-x64/rabix-composer.app/Contents/MacOS/rabix-composer
                // Linux: build/rabix-composer-linux-x64/rabix-composer
                const files = glob.sync("./build/**/rabix-composer");

                if (!files.length) {
                    throw new Error("You must build and package the app before running e2e tests");
                }
                return files[0];
            })(),
            args: ["--webdriver-e2e"]
        }
    },
    // baseUrl: "http://localhost:4200/",
    framework: "jasmine",
    // This should ideally be true, but it would prevent testing flows
    // in which we check if some state is preserved between restarts
    restartBrowserBetweenTests: false,
    jasmineNodeOpts: {
        showColors: true,
        defaultTimeoutInterval: 30000,
        print: function () {
        }
    },
    onPrepare() {
        require('ts-node').register({
            project: 'e2e/tsconfig.json'
        });
        jasmine.getEnv().addReporter(new SpecReporter({spec: {displayStacktrace: true}}));

        jasmine.getEnv().afterAll(() => {
            browser.executeScript(`return window["require"]("electron").remote.app.getPath("userData")`).then(dataPath => {
                rimraf.sync(dataPath);
            });
        });
    }
};
