const Application = require("spectron").Application;
const assert = require("assert");
const glob = require("glob");

describe('Application Launch', function () {

    this.timeout(10000);

    beforeEach(() => {
        return new Promise((resolve, reject) => {
            glob(process.cwd() + "/build/**/rabix-editor", (err, files) => {
                if (err) throw err;
                if (!files.length) throw new Error("No packaged apps found.");

                this.app = new Application({path: files[0]});
                this.app.start().then(res => resolve(res), rej => reject(rej));
            });
        });
    });

    afterEach(() => {
        if (this.app && this.app.isRunning()) {
            return this.app.stop();
        }
    });

    it("starts successfully", (done) => {
        this.app.client.getHTML("[data-marker='ready']", false).then(content => {
            assert.equal(content, 'ready');
            done();
        });
    });
});