const assert = require("assert");
const glob = require("glob");
const {boot, shutdown} = require("./boot");

describe("Application Launch", function () {

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


    it("starts successfully", (done) => {
        this.app.client.getHTML("[data-marker='ready']", false).then(content => {
            assert.equal(content, 'ready');
            done();
        }, err => {
            done(err);
        });
    });
});
