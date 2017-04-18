const assert = require("assert");
const glob = require("glob");
const {boot, shutdown} = require("./boot");

describe("Settings Button", function() {

    /**
     * This sets how much time do we wait for an app to run before test is marked as failing
     */
    this.timeout(10000);

    /**
     * Start the app before each test and save the reference to the Application object
     */
    beforeEach(() => boot().then(app => this.app = app));

    /**
     * Shut down the app after each test so we have a clean state
     */
    afterEach(() => shutdown(this.app));


    it("opens settings tab", (done) => {
        this.app.client.click("ct-settings-button").then(el => {
            this.app.client.getText("ct-workbox .ct-workbox-tab").then(text => {
                assert.equal(text, "Settings");
            });
            done();
        }, err => {
            done(err);
        });
    });
});
