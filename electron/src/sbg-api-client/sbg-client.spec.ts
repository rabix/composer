import {assert} from "chai";
import {SBGClient} from "./sbg-client";
import {RequestError, StatusCodeError} from "request-promise-native/errors";

describe("SBGClient", () => {
    let client: SBGClient;

    beforeEach(() => {
        client = new SBGClient("https://api.sbgenomics.com", "");
    });

    describe("user", () => {
        it("should have a get method", () => {
            assert.isFunction(client.user.get);
        });

        it("can be tested", (done) => {
            const req = client.user.get();

            req.then(result => {
                done();
            }, (fail: StatusCodeError | RequestError) => {
                done()
            })
        });
    });

    describe("projects", () => {
        it("should have the `all` method", () => {
            assert.isFunction((client.projects.all));
        });

        it("should be able to fetch all projects", function(done) {
            this.timeout(20000);

            client.projects.all().then(projects => {
                debugger;
                done();
            });
        });
    });
});
